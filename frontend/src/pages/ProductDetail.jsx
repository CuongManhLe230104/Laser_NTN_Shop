import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPhone, FiCheck, FiArrowLeft, FiStar, FiHeart, FiShare2 } from 'react-icons/fi';
import { productAPI, cartAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

// Bản đồ hình ảnh chi tiết bổ sung cho các sản phẩm
const detailImagesMap = {
  'den-led-3d': ['/den-ngu-1.jpg', '/den-ngu-2.jpg'],
  'hop-cam-but-go-khac-chu': ['/hop-but-1.jpg', '/hop-but-2.jpg'],
  'moc-khoa-go-khac-ten': ['/moc-khoa-1.jpg']
};

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery State
  const [activeImage, setActiveImage] = useState('');
  const [imagesList, setImagesList] = useState([]);

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [cartError, setCartError] = useState('');

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const [submitRating, setSubmitRating] = useState(5);
  const [submitComment, setSubmitComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const shopPhone = '0986814523';

  // Load product detail
  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      setError(null);
      setAddedSuccess(false);
      setCartError('');
      setQuantity(1);

      try {
        const response = await productAPI.getBySlug(slug);
        if (response.data.success) {
          const prod = response.data.data;
          setProduct(prod);
          setActiveImage(prod.image_url);

          // Xây dựng danh sách ảnh (ảnh chính + ảnh chi tiết từ DB và map)
          const dbExtraImages = prod.extra_images 
            ? prod.extra_images.split(',').map(img => img.trim()).filter(img => img !== '')
            : [];
          const mapExtraImages = detailImagesMap[prod.slug] || [];
          const allExtraImages = Array.from(new Set([...dbExtraImages, ...mapExtraImages]));
          setImagesList([prod.image_url, ...allExtraImages]);

          // Fetch sản phẩm liên quan (cùng danh mục)
          if (prod.category_slug) {
            const relatedRes = await productAPI.getAll({ 
              category: prod.category_slug,
              limit: 5 // Lấy 5 để sau khi lọc bỏ sản phẩm hiện tại còn 4
            });
            if (relatedRes.data.success) {
              const filtered = (relatedRes.data.data || []).filter(p => p.id !== prod.id).slice(0, 4);
              setRelatedProducts(filtered);
            }
          }
        }
      } catch (err) {
        console.error('Lỗi load chi tiết sản phẩm:', err);
        setError(err.response?.data?.message || 'Không thể tải chi tiết sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [slug]);

  // Load reviews and stats
  const fetchReviews = async () => {
    if (!product?.id) return;
    try {
      const res = await productAPI.getReviews(product.id);
      if (res.data.success) {
        setReviews(res.data.data.reviews || []);
        setAvgRating(res.data.data.average_rating || 0);
        setTotalReviewsCount(res.data.data.total_reviews || 0);
      }
    } catch (err) {
      console.error('Lỗi tải đánh giá sản phẩm:', err);
    }
  };

  useEffect(() => {
    if (product?.id) {
      fetchReviews();
    }
  }, [product?.id]);

  const token = localStorage.getItem('token');

  // Submit new review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const res = await productAPI.createReview(product.id, {
        rating: submitRating,
        comment: submitComment,
      });
      if (res.data.success) {
        setSubmitSuccess(res.data.message);
        setSubmitComment('');
        setSubmitRating(5);
        fetchReviews();
        // Xóa thông báo thành công sau 4 giây
        setTimeout(() => setSubmitSuccess(''), 4000);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Gửi đánh giá thất bại.');
      setTimeout(() => setSubmitError(''), 4000);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Tự động chuyển đổi hình ảnh (slideshow) sau mỗi 3.5 giây
  useEffect(() => {
    if (imagesList.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImage((current) => {
        const currentIndex = imagesList.indexOf(current);
        const nextIndex = (currentIndex + 1) % imagesList.length;
        return imagesList[nextIndex];
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [imagesList, activeImage]);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async (e) => {
    if (e) e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    setCartError('');
    setAddedSuccess(false);

    try {
      await cartAPI.addItem({ product_id: product.id, quantity });
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    } catch (err) {
      setCartError(err.response?.data?.message || 'Lỗi thêm sản phẩm vào giỏ.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await cartAPI.addItem({ product_id: product.id, quantity });
      navigate('/cart');
    } catch (err) {
      setCartError(err.response?.data?.message || 'Lỗi xử lý đặt hàng nhanh.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleOpenLiveChat = () => {
    const chatBtn = document.querySelector('.contact-btn--chat');
    if (chatBtn) {
      chatBtn.click();
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="detail-loading-spinner"></div>
        <p style={{ marginTop: '20px', color: '#9E8060', fontWeight: '500' }}>Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="detail-error-card glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h2 style={{ margin: '15px 0 10px 0', color: '#1a1a1a' }}>Không Tìm Thấy Sản Phẩm</h2>
          <p style={{ color: '#666', marginBottom: '25px' }}>{error || 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.'}</p>
          <Link to="/products" className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FiArrowLeft /> Quay Lại Sản Phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page container">
      {/* Breadcrumb */}
      <nav className="detail-breadcrumb">
        <Link to="/">Trang chủ</Link> <span>/</span>
        <Link to="/products">Sản phẩm</Link> <span>/</span>
        {product.category_name && (
          <>
            <Link to={`/products?category=${product.category_slug}`}>{product.category_name}</Link> <span>/</span>
          </>
        )}
        <span className="active-breadcrumb">{product.name}</span>
      </nav>

      {/* Main product wrapper */}
      <div className="product-main-grid glass-card">
        {/* Gallery Column */}
        <div className="product-gallery">
          <div className="main-image-wrap">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="main-product-image"
              onError={(e) => { e.target.src = 'https://placehold.co/600x450/1a1a2e/6c63ff?text=No+Image' }}
            />
            {product.stock === 0 && (
              <span className="detail-badge detail-badge--out">Hết Hàng</span>
            )}
          </div>

          {/* Thumbnails Row */}
          {imagesList.length > 1 && (
            <div className="thumbnails-row">
              {imagesList.map((img, index) => (
                <button 
                  key={index} 
                  className={`thumbnail-btn ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`} 
                    onError={(e) => { e.target.src = 'https://placehold.co/100x80/1a1a2e/6c63ff?text=No+Image' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Info Column */}
        <div className="product-info-col">
          {product.category_name && (
            <span className="product-category-badge">{product.category_name}</span>
          )}

          <h1 className="product-detail-name">{product.name}</h1>

          {/* Rating */}
          <div className="product-detail-rating">
            <div className="stars-list">
              {[1, 2, 3, 4, 5].map((s) => (
                <FiStar 
                  key={s} 
                  size={15} 
                  fill={s <= Math.round(avgRating) ? '#B5722A' : 'none'} 
                  color="#B5722A" 
                />
              ))}
            </div>
            <span className="rating-text">
              ({avgRating > 0 ? `${avgRating} / 5.0` : 'Chưa có đánh giá'} từ {totalReviewsCount} đánh giá)
            </span>
          </div>

          {/* Price */}
          <div className="product-detail-price">
            {product.price.toLocaleString('vi-VN')}₫
          </div>

          <p className="product-brief-desc">{product.description}</p>

          <hr className="detail-divider" />

          {/* Stock & Quantity selection */}
          <div className="detail-stock-row">
            <span className="stock-label">Trạng thái:</span>
            {product.stock > 0 ? (
              <span className="stock-status in-stock">Còn hàng ({product.stock} sản phẩm trong kho)</span>
            ) : (
              <span className="stock-status out-of-stock">Tạm hết hàng</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="quantity-selection-row">
              <span className="quantity-label">Số lượng:</span>
              <div className="quantity-selector-btn-wrap">
                <button onClick={handleDecrement} className="quantity-dec-btn" disabled={quantity <= 1}>-</button>
                <input 
                  type="number" 
                  value={quantity} 
                  readOnly 
                  className="quantity-input-val" 
                />
                <button onClick={handleIncrement} className="quantity-inc-btn" disabled={quantity >= product.stock}>+</button>
              </div>
            </div>
          )}

          {/* Purchase Actions */}
          <div className="purchase-actions-group">
            <button 
              className={`btn-add-to-cart ${addedSuccess ? 'added-success' : ''}`}
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
            >
              {addedSuccess ? (
                <><FiCheck size={18} /> Đã Thêm Vào Giỏ</>
              ) : (
                <><FiShoppingCart size={18} /> Thêm Vào Giỏ Hàng</>
              )}
            </button>

            <button 
              className="btn-buy-now"
              onClick={handleBuyNow}
              disabled={addingToCart || product.stock === 0}
            >
              ⚡ Mua Ngay
            </button>
          </div>

          {cartError && <div className="cart-error-message">{cartError}</div>}

          {/* Additional details list */}
          <div className="product-perks-list">
            <div className="perk-item">
              <span className="perk-icon">🌳</span>
              <div className="perk-text">
                <h5>Chất liệu gỗ cao cấp tự nhiên</h5>
                <p>Chế tác tỉ mỉ từ gỗ tự nhiên nguyên khối, bền đẹp và thân thiện môi trường.</p>
              </div>
            </div>
            <div className="perk-item">
              <span className="perk-icon">🎨</span>
              <div className="perk-text">
                <h5>Khắc logo & tên theo yêu cầu</h5>
                <p>Khắc tên, logo, câu chúc miễn phí theo yêu cầu để tạo quà tặng ý nghĩa.</p>
              </div>
            </div>
          </div>

          <hr className="detail-divider" />

          {/* Direct Support Contact Buttons */}
          <div className="detail-support-buttons">
            <a 
              href={`https://zalo.me/${shopPhone}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="detail-support-link zalo-support"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" />
              Tư vấn Zalo sỉ / lẻ
            </a>
            <button 
              onClick={handleOpenLiveChat} 
              className="detail-support-link web-support"
            >
              💬 Chat trực tuyến ngay
            </button>
          </div>

        </div>
      </div>

      {/* Description Detailed Section */}
      <section className="product-desc-section glass-card">
        <h3>Mô tả chi tiết sản phẩm</h3>
        <div className="product-desc-content">
          <p>{product.description}</p>
          <p>
            Sản phẩm được chế tác trực tiếp tại **Laser NTN Shop**. Mỗi đường khắc đều được gia công tinh tế bằng máy laser hiện đại, đảm bảo tính thẩm mỹ cao nhất. Thích hợp làm quà tặng doanh nghiệp sỉ, quà kỷ niệm cho người thân, đối tác hoặc dùng để trang trí không gian làm việc thêm phần trang nhã, ấm áp.
          </p>
          <p>
            Vui lòng liên hệ trực tiếp với chúng tôi nếu bạn có bất kỳ yêu cầu thiết kế hoa văn riêng biệt nào khác.
          </p>
        </div>
      </section>

      {/* Product Reviews Section */}
      <section className="product-reviews-section glass-card">
        <h3>Đánh giá từ khách hàng ({totalReviewsCount})</h3>
        
        <div className="reviews-summary-container">
          <div className="rating-summary-left">
            <span className="summary-number">{avgRating > 0 ? avgRating : '0'}</span>
            <div className="summary-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <FiStar key={s} size={18} fill={s <= Math.round(avgRating) ? '#B5722A' : 'none'} color="#B5722A" />
              ))}
            </div>
            <span className="summary-text">Điểm đánh giá trung bình</span>
          </div>

          <div className="review-form-right">
            <h4>{token ? 'Chia sẻ đánh giá của bạn' : 'Đăng nhập để gửi đánh giá'}</h4>
            {token ? (
              <form onSubmit={handleSubmitReview} className="detail-review-form">
                <div className="form-stars-select">
                  <span className="select-stars-label">Chọn số sao: </span>
                  <div className="select-stars-list">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setSubmitRating(s)}
                        className="star-select-btn"
                        title={`${s} sao`}
                      >
                        <FiStar size={20} fill={s <= submitRating ? '#B5722A' : 'none'} color="#B5722A" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-comment-textarea-wrap">
                  <textarea
                    rows="3"
                    placeholder="Bình luận đánh giá của bạn về sản phẩm gỗ này (ví dụ: độ hoàn thiện, màu sắc, cách đóng gói...)"
                    value={submitComment}
                    onChange={(e) => setSubmitComment(e.target.value)}
                    required
                  />
                </div>

                {submitError && <div className="review-submit-error">{submitError}</div>}
                {submitSuccess && <div className="review-submit-success">{submitSuccess}</div>}

                <button type="submit" disabled={submitLoading} className="btn-submit-review">
                  {submitLoading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              </form>
            ) : (
              <div className="login-to-review-notice">
                Bạn cần <Link to="/login">đăng nhập tài khoản</Link> để viết bình luận đánh giá cho sản phẩm này.
              </div>
            )}
          </div>
        </div>

        <hr className="reviews-divider" />

        {/* Reviews List */}
        <div className="reviews-list-container">
          {reviews.length === 0 ? (
            <div className="reviews-list-empty">
              <span className="empty-reviews-icon">💬</span>
              <p>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
            </div>
          ) : (
            <div className="reviews-feed">
              {reviews.map((rev) => {
                const revTime = new Date(rev.created_at).toLocaleDateString('vi-VN');
                return (
                  <div key={rev.id} className="review-item-card">
                    <div className="review-item-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {rev.user_avatar ? (
                            <img src={rev.user_avatar} alt={rev.user_name} />
                          ) : (
                            <span>{rev.user_name[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h5 className="reviewer-name">{rev.user_name}</h5>
                          <span className="review-date">{revTime}</span>
                        </div>
                      </div>
                      <div className="reviewer-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} size={14} fill={s <= rev.rating ? '#B5722A' : 'none'} color="#B5722A" />
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p className="review-item-comment">{rev.comment}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <h3 className="section-title">Sản phẩm liên quan</h3>
          <div className="related-products-grid">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
