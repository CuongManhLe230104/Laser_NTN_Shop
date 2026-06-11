import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiFilter, FiGrid, FiList, FiLoader } from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import { productAPI } from '../services/api'
import './Products.css'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const currentCategory = searchParams.get('category') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentPage = parseInt(searchParams.get('page')) || 1

  const [searchInput, setSearchInput] = useState(currentSearch)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = { page: currentPage, limit: 12 }
      if (currentCategory) params.category = currentCategory
      if (currentSearch) params.search = currentSearch

      const res = await productAPI.getAll(params)
      setProducts(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      setError('Không thể tải sản phẩm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [currentPage, currentCategory, currentSearch])

  const fetchCategories = async () => {
    try {
      const res = await productAPI.getCategories()
      setCategories(res.data.data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { fetchCategories() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ search: searchInput, page: 1 })
  }

  const handleCategoryFilter = (slug) => {
    setSearchParams({ category: slug, page: 1 })
  }

  const handlePageChange = (page) => {
    const params = { page }
    if (currentCategory) params.category = currentCategory
    if (currentSearch) params.search = currentSearch
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="products-page">
      <div className="container">
        {/* Header */}
        <div className="products-page__header">
          <div>
            <h1 className="section-title">
              Tất Cả <span className="gradient-text">Sản Phẩm</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {pagination.total ? `Tìm thấy ${pagination.total} sản phẩm` : 'Đang tải...'}
            </p>
          </div>

          {/* Search */}
          <form className="products-page__search" onSubmit={handleSearch}>
            <input
              type="text"
              className="input-field"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              id="product-search"
            />
            <button type="submit" className="btn-primary" style={{ padding: '14px 20px' }}>
              <FiSearch size={18} />
            </button>
          </form>
        </div>

        <div className="products-page__layout">
          {/* Sidebar */}
          <aside className="products-page__sidebar">
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 className="products-page__sidebar-title">
                <FiFilter size={16} /> Danh Mục
              </h3>
              <ul className="products-page__cats">
                <li>
                  <button
                    className={!currentCategory ? 'active' : ''}
                    onClick={() => handleCategoryFilter('')}
                  >
                    Tất Cả
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      className={currentCategory === cat.slug ? 'active' : ''}
                      onClick={() => handleCategoryFilter(cat.slug)}
                    >
                      {cat.name}
                      <span>{cat.product_count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="products-page__content">
            {loading ? (
              <div className="products-page__loading">
                <div className="spinner" />
                <p>Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="alert alert-error">{error}</div>
            ) : products.length === 0 ? (
              <div className="products-page__empty">
                <p>😕 Không tìm thấy sản phẩm nào.</p>
                <button className="btn-secondary" onClick={() => { setSearchParams({}); setSearchInput('') }}>
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="products-page__pagination">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`products-page__page-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
