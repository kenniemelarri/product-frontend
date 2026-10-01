import { useState } from 'react'
import './App.css'

const API_URL = 'https://salazar-melarri-kenn-lavalust.onrender.com/index.php'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem('access_token')
  )

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)

  // products = product list page
  // add = add product page
  const [activeView, setActiveView] = useState('products')

  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [addingProduct, setAddingProduct] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingPrice, setEditingPrice] = useState('')
  const [editingQuantity, setEditingQuantity] = useState('')
  const [updatingProduct, setUpdatingProduct] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Login failed.'
        )
      }

      localStorage.setItem(
        'access_token',
        data.tokens.access_token
      )

      localStorage.setItem(
        'refresh_token',
        data.tokens.refresh_token
      )

      if (data.user?.username) {
        setUsername(data.user.username)
      }

      setLoggedIn(true)
      setActiveView('products')
      setMessage('Login successful!')

    } catch (error) {
      setMessage(error.message)
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  // GET PRODUCTS
  const getProducts = async () => {
    setProductsLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('access_token')

      const response = await fetch(
        `${API_URL}/api/products`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Failed to get products.'
        )
      }

      setProducts(
        data.products ||
        data.data ||
        []
      )

      setMessage('Products loaded successfully!')

    } catch (error) {
      setMessage(error.message)
      console.error('Products error:', error)
    } finally {
      setProductsLoading(false)
    }
  }

  // ADD PRODUCT
  const addProduct = async (e) => {
    e.preventDefault()
    setMessage('')
    setAddingProduct(true)

    try {
      const token = localStorage.getItem('access_token')

      const response = await fetch(
        `${API_URL}/api/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_name: productName,
            description: description,
            price: price,
            quantity: quantity,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Failed to add product.'
        )
      }

      setMessage('Product added successfully!')

      setProductName('')
      setDescription('')
      setPrice('')
      setQuantity('')

      // Go back to Products page after adding
      setActiveView('products')

      // Refresh product list
      getProducts()

    } catch (error) {
      setMessage(error.message)
      console.error('Add product error:', error)
    } finally {
      setAddingProduct(false)
    }
  }

  // START EDIT
  const startEdit = (product) => {
    setEditingId(product.id)
    setEditingName(product.product_name)
    setEditingDescription(product.description || '')
    setEditingPrice(product.price)
    setEditingQuantity(product.quantity)
    setMessage('')
  }

  // CANCEL EDIT
  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setEditingDescription('')
    setEditingPrice('')
    setEditingQuantity('')
  }

  // UPDATE PRODUCT
  const updateProduct = async (e) => {
    e.preventDefault()
    setMessage('')
    setUpdatingProduct(true)

    try {
      const token = localStorage.getItem('access_token')

      const response = await fetch(
        `${API_URL}/api/products/${editingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_name: editingName,
            description: editingDescription,
            price: editingPrice,
            quantity: editingQuantity,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Failed to update product.'
        )
      }

      setMessage('Product updated successfully!')

      cancelEdit()

      getProducts()

    } catch (error) {
      setMessage(error.message)
      console.error('Update product error:', error)
    } finally {
      setUpdatingProduct(false)
    }
  }

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    )

    if (!confirmed) {
      return
    }

    setMessage('')
    setDeletingId(id)

    try {
      const token = localStorage.getItem('access_token')

      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Failed to delete product.'
        )
      }

      setMessage('Product deleted successfully!')

      getProducts()

    } catch (error) {
      setMessage(error.message)
      console.error('Delete product error:', error)
    } finally {
      setDeletingId(null)
    }
  }

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    setLoggedIn(false)
    setProducts([])
    setActiveView('products')
    setMessage('')
  }

  // =========================
  // LOGGED-IN DASHBOARD
  // =========================

  if (loggedIn) {
    return (
      <div className="products-container">

        <div className="products-box">

          {/* HEADER */}
          <div className="products-header">

            <div>
              <span className="dashboard-label">
                PRODUCT SYSTEM
              </span>

              <h1>
                Product Management
              </h1>

              <p>
                Welcome, {username || 'User'}!
              </p>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

          {/* NAVIGATION */}
          <div className="products-nav">

            <button
              className={
                activeView === 'products'
                  ? 'active'
                  : ''
              }
              onClick={() => {
                setActiveView('products')
                setMessage('')
              }}
            >
              View Products
            </button>

            <button
              className={
                activeView === 'add'
                  ? 'active'
                  : ''
              }
              onClick={() => {
                setActiveView('add')
                setMessage('')
              }}
            >
              Add Product
            </button>

          </div>

          {/* =========================
              ADD PRODUCT PAGE
          ========================= */}

          {activeView === 'add' && (
            <div className="content-section">

              <div className="section-heading">
                <span className="section-tag">
                  NEW PRODUCT
                </span>

                <h2>
                  Add Product
                </h2>

                <p>
                  Enter the product information below.
                </p>
              </div>

              <form
                className="product-form"
                onSubmit={addProduct}
              >

                <div className="form-group">
                  <label>
                    Product Name
                  </label>

                  <input
                    type="text"
                    value={productName}
                    onChange={(e) =>
                      setProductName(e.target.value)
                    }
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Description
                  </label>

                  <input
                    type="text"
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Enter product description"
                  />
                </div>

                <div className="form-row">

                  <div className="form-group">
                    <label>
                      Price
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value)
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value)
                      }
                      placeholder="0"
                      required
                    />
                  </div>

                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={addingProduct}
                >
                  {addingProduct
                    ? 'Adding Product...'
                    : 'Add Product'}
                </button>

              </form>

              {message && (
                <p className="message">
                  {message}
                </p>
              )}

            </div>
          )}

          {/* =========================
              PRODUCTS PAGE
          ========================= */}

          {activeView === 'products' && (
            <div className="content-section">

              <div className="section-heading">

                <span className="section-tag">
                  PRODUCT LIST
                </span>

                <h2>
                  Your Products
                </h2>

                <p>
                  View and manage your available products.
                </p>

              </div>

              <button
                className="load-button"
                onClick={getProducts}
                disabled={productsLoading}
              >
                {productsLoading
                  ? 'Loading Products...'
                  : 'Load Products'}
              </button>

              {message && (
                <p className="message">
                  {message}
                </p>
              )}

              <div className="products-list">

                {products.length === 0 &&
                  !productsLoading && (
                    <div className="empty-products">
                      <h3>
                        No Products Yet
                      </h3>

                      <p>
                        Click "Add Product" above to create
                        your first product.
                      </p>
                    </div>
                  )}

                {products.map((product) => (

                  <div
                    className="product-card"
                    key={product.id}
                  >

                    {editingId === product.id ? (

                      /* EDIT FORM */
                      <form
                        onSubmit={updateProduct}
                        className="edit-form"
                      >

                        <div className="edit-header">
                          <span className="section-tag">
                            EDIT PRODUCT
                          </span>

                          <h3>
                            Update Product
                          </h3>
                        </div>

                        <div className="form-group">
                          <label>
                            Product Name
                          </label>

                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) =>
                              setEditingName(
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Description
                          </label>

                          <input
                            type="text"
                            value={editingDescription}
                            onChange={(e) =>
                              setEditingDescription(
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-row">

                          <div className="form-group">
                            <label>
                              Price
                            </label>

                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingPrice}
                              onChange={(e) =>
                                setEditingPrice(
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>
                              Quantity
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={editingQuantity}
                              onChange={(e) =>
                                setEditingQuantity(
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>

                        </div>

                        <div className="edit-actions">

                          <button
                            className="primary-button"
                            type="submit"
                            disabled={updatingProduct}
                          >
                            {updatingProduct
                              ? 'Updating...'
                              : 'Save Changes'}
                          </button>

                          <button
                            className="cancel-button"
                            type="button"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>

                        </div>

                      </form>

                    ) : (

                      /* PRODUCT CARD */
                      <>

                        <div className="product-card-top">

                          <div>
                            <span className="product-id">
                              PRODUCT #{product.id}
                            </span>

                            <h3>
                              {product.product_name}
                            </h3>
                          </div>

                          <div className="product-price">
                            ₱{product.price}
                          </div>

                        </div>

                        <p className="product-description">
                          {product.description ||
                            'No description available.'}
                        </p>

                        <div className="product-info">

                          <span>
                            Quantity:
                            <strong>
                              {product.quantity}
                            </strong>
                          </span>

                        </div>

                        <div className="product-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              startEdit(product)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteProduct(product.id)
                            }
                            disabled={
                              deletingId === product.id
                            }
                          >
                            {deletingId === product.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>

                        </div>

                      </>

                    )}

                  </div>

                ))}

              </div>

            </div>
          )}

        </div>
      </div>
    )
  }

  // =========================
  // LOGIN PAGE
  // =========================

  return (
    <div className="login-container">

      <div className="login-box">

        <div className="login-brand">
          <span>
            PRODUCT SYSTEM
          </span>

          <h1>
            Product Management
          </h1>

          <p>
            Login to continue to your dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="form-group">

            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter username"
              required
            />

          </div>

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              required
            />

          </div>

          <button
            className="primary-button login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Logging in...'
              : 'Login'}
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>

    </div>
  )
}

export default App