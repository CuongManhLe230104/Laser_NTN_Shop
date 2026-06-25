const { pool } = require('../config/db');

/**
 * Gọi Gemini API hoặc OpenRouter để sinh câu trả lời tự động cho khách hàng
 * @param {number} conversationId - ID cuộc trò chuyện
 * @returns {Promise<string|null>} - Câu trả lời từ AI hoặc null nếu có lỗi
 */
const generateBotResponse = async (conversationId) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.warn('⚠️ GEMINI_API_KEY is not configured. AI Chatbot response skipped.');
    return null;
  }

  try {
    // 1. Kiểm tra trạng thái is_bot_active của cuộc hội thoại
    const [conversations] = await pool.execute(
      `SELECT is_bot_active, status FROM chat_conversations WHERE id = ?`,
      [conversationId]
    );

    if (conversations.length === 0) {
      console.warn(`⚠️ Conversation ID ${conversationId} not found.`);
      return null;
    }

    const { is_bot_active, status } = conversations[0];
    if (!is_bot_active || status !== 'open') {
      return null; // Bot không hoạt động hoặc cuộc trò chuyện đã đóng
    }

    // 2. Lấy danh sách sản phẩm hiện có
    const [products] = await pool.execute(`
      SELECT p.name, p.price, p.stock, p.description, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `);

    // Định dạng danh sách sản phẩm thành text để đưa vào prompt
    let formattedProducts = 'Không có thông tin sản phẩm.';
    if (products.length > 0) {
      formattedProducts = products.map((p, idx) => {
        return `${idx + 1}. Tên: ${p.name}\n   Giá: ${Number(p.price).toLocaleString('vi-VN')} VNĐ\n   Tồn kho: ${p.stock} sản phẩm\n   Danh mục: ${p.category_name || 'Khác'}\n   Mô tả: ${p.description || 'Không có mô tả.'}`;
      }).join('\n\n');
    }

    // 3. Lấy lịch sử 6 tin nhắn gần nhất của cuộc hội thoại để tạo ngữ cảnh
    const [messages] = await pool.execute(
      `SELECT sender_role, content FROM chat_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 6`,
      [conversationId]
    );

    // Đảo ngược lại để đúng thứ tự thời gian tăng dần
    const history = messages.reverse();

    // 4. Xây dựng System Instruction cho Gemini
    const systemInstruction = `Bạn là "NTN Laser Bot" - trợ lý bán hàng AI thông minh, thân thiện của cửa hàng Laser NTN Shop.
Laser NTN Shop chuyên về các sản phẩm quà tặng gỗ handmade, gia công cắt khắc laser tinh xảo, thiết kế riêng theo yêu cầu của khách hàng tại Việt Nam (như khắc tên, logo lên hộp cắm bút, lịch gỗ, đèn ngủ, móc khóa...).

Thông tin liên hệ của Shop:
- Hotline / Zalo: 0986814523 (Tư vấn sỉ/lẻ, thiết kế riêng)
- Trang web: http://localhost:3000

Dưới đây là danh sách sản phẩm hiện có tại cửa hàng của shop để bạn tham khảo và tư vấn:
${formattedProducts}

HƯỚNG DẪN TRẢ LỜI:
1. Chỉ tư vấn về các sản phẩm có trong danh sách trên. Nếu khách hỏi sản phẩm không có, hãy trả lời lịch sự rằng shop hiện chưa có sản phẩm này nhưng có nhận thiết kế và gia công theo yêu cầu, khuyên khách liên hệ Zalo 0986814523.
2. Trả lời bằng tiếng Việt, giọng điệu thân thiện, lễ phép (dùng "dạ", "ạ", xưng "Shop" hoặc "Em" và gọi khách là "Anh/Chị").
3. Giữ câu trả lời ngắn gọn, cô đọng, phù hợp với giao diện khung chat nhỏ (khoảng 2-4 câu). Tránh viết quá dài dòng.
4. Nếu khách hàng hỏi về khắc tên, khắc logo, quà tặng thiết kế riêng, đặt hàng số lượng lớn (sỉ) hoặc yêu cầu hỗ trợ gấp từ con người: Hãy giới thiệu dịch vụ thiết kế theo yêu cầu của shop, hướng dẫn họ gửi yêu cầu trực tiếp qua khung chat hoặc liên hệ Zalo/Hotline: 0986814523 để được hỗ trợ nhanh nhất.
5. Nếu khách hỏi trạng thái đơn hàng hoặc các vấn đề tài khoản cá nhân, hãy hướng dẫn họ vào trang "Đơn hàng" (Orders) hoặc liên hệ số hotline để nhân viên hỗ trợ trực tiếp.
6. Nếu khách hàng khen ngợi, cảm ơn hoặc chào hỏi, hãy phản hồi lại một cách lịch sự, vui vẻ và thân thiện nhất.`;

    // 5. Kiểm tra loại API Key (Google AI Studio hay OpenRouter)
    const isOpenRouter = apiKey.startsWith('sk-or-');
    let response;

    if (isOpenRouter) {
      // Gọi thông qua OpenRouter (Sử dụng chuẩn OpenAI)
      const openAiMessages = [
        { role: 'system', content: systemInstruction }
      ];

      for (const msg of history) {
        openAiMessages.push({
          role: msg.sender_role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }

      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Laser NTN Shop'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: openAiMessages,
          max_tokens: 256,
          temperature: 0.7
        })
      });

    } else {
      // Gọi trực tiếp Google Gemini API
      const contents = [];
      for (const msg of history) {
        const role = msg.sender_role === 'user' ? 'user' : 'model';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += '\n' + msg.content;
        } else {
          contents.push({
            role: role,
            parts: [{ text: msg.content }]
          });
        }
      }

      // Đảm bảo tin nhắn cuối cùng trong mảng contents phải là của 'user'
      if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
        console.warn('⚠️ The last message in chat history is not from the user. Bot will not reply.');
        return null;
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256,
          }
        })
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errText);
      return null;
    }

    const data = await response.json();
    
    if (isOpenRouter) {
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      }
    } else {
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text.trim();
      }
    }

    console.warn('⚠️ API returned empty response or invalid format:', JSON.stringify(data));
    return null;

  } catch (error) {
    console.error('❌ Error in generateBotResponse:', error);
    return null;
  }
};

/**
 * Phân tích tất cả đánh giá của khách hàng và lập báo cáo xu hướng bằng AI
 * @returns {Promise<string>} - Báo cáo phân tích định dạng Markdown
 */
const analyzeReviews = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return '⚠️ GEMINI_API_KEY chưa được cấu hình. Không thể chạy phân tích AI.';
  }

  try {
    // 1. Lấy tất cả đánh giá kèm tên sản phẩm và tên người dùng
    const [reviews] = await pool.execute(`
      SELECT r.rating, r.comment, r.created_at, p.name AS product_name, u.name AS user_name
      FROM product_reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    if (reviews.length === 0) {
      return '### 📝 Phân Tích Đánh Giá Bằng AI\n\nHiện tại chưa có đánh giá nào từ khách hàng trong cơ sở dữ liệu để thực hiện phân tích. Hãy quay lại sau khi người dùng gửi phản hồi của họ!';
    }

    // 2. Định dạng danh sách đánh giá
    let formattedReviews = '';
    reviews.forEach((r, idx) => {
      formattedReviews += `Đánh giá #${idx + 1}:\n- Sản phẩm: ${r.product_name}\n- Người đánh giá: ${r.user_name}\n- Điểm số: ${r.rating}/5 sao\n- Nội dung: "${r.comment || 'Không ghi bình luận.'}"\n- Ngày gửi: ${new Date(r.created_at).toLocaleDateString('vi-VN')}\n\n`;
    });

    // 3. Xây dựng prompt
    const prompt = `Bạn là một chuyên gia phân tích dữ liệu và trải nghiệm khách hàng (Customer Experience Insights). Dưới đây là danh sách toàn bộ các đánh giá thực tế của khách hàng về các sản phẩm tại Laser NTN Shop:

${formattedReviews}

Hãy viết một bản báo cáo phân tích chi tiết, khách quan bằng Tiếng Việt dựa hoàn toàn vào dữ liệu đánh giá trên. Bản báo cáo phải định dạng bằng Markdown đẹp mắt và bao gồm các phần chính sau:

## 📊 1. Tổng quan sự hài lòng
- Tính điểm số trung bình (ví dụ: trung bình bao nhiêu sao).
- Thống kê tỷ lệ đánh giá tích cực (4-5 sao) so với tiêu cực/trung bình (1-3 sao).

## 🌟 2. Điểm mạnh nổi bật (Pros)
- Tổng hợp xem khách hàng hài lòng nhiều nhất về những khía cạnh nào (ví dụ: chất lượng gỗ, độ sắc nét của đường khắc laser, cách đóng gói hay thái độ giao hàng...).

## ⚠️ 3. Vấn đề & Điểm cần khắc phục (Cons)
- Nhận diện các vấn đề lớn nhất khách hàng đang gặp phải hoặc phàn nàn nhiều (ví dụ: kích thước không giống hình, sản phẩm có mùi khét do laser chưa được vệ sinh kỹ, chậm giao hàng...). 
- Nếu không có đánh giá tiêu cực, hãy nêu rõ điều đó nhưng đề xuất một số điểm nên lưu ý để giữ chất lượng sản phẩm.

## 🛠️ 4. Đề xuất hành động cho cửa hàng
- Đưa ra 3-4 lời khuyên hành động thực tế, cụ thể mà Admin có thể thực hiện ngay để cải thiện chất lượng sản phẩm và nâng cao trải nghiệm của khách.

## 📈 5. Phân tích nhu cầu & Xu hướng mua sắm
- Từ dữ liệu đánh giá, phân tích xem sản phẩm nào đang thu hút nhiều sự quan tâm và được yêu thích nhất. Dự báo nhu cầu tiếp theo của khách hàng để giúp shop có định hướng chuẩn bị phôi gỗ và marketing phù hợp.

Chú ý: Hãy viết văn phong chuyên nghiệp, mạch lạc, dễ đọc. Không sử dụng định dạng HTML, chỉ dùng Markdown chuẩn (như ## cho tiêu đề, - cho danh sách đầu dòng, **cho chữ đậm).`;

    const isOpenRouter = apiKey.startsWith('sk-or-');
    let response;

    if (isOpenRouter) {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Laser NTN Shop'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 1024,
          temperature: 0.5
        })
      });
    } else {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024,
          }
        })
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ Gemini/OpenRouter API Error (${response.status}):`, errText);
      return `❌ Lỗi khi gửi yêu cầu tới API của AI (${response.status}).`;
    }

    const data = await response.json();
    let resultText = '';

    if (isOpenRouter) {
      if (data.choices && data.choices[0] && data.choices[0].message) {
        resultText = data.choices[0].message.content.trim();
      }
    } else {
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        resultText = data.candidates[0].content.parts[0].text.trim();
      }
    }

    if (resultText) {
      return resultText;
    }

    return '⚠️ Không nhận được phản hồi hợp lệ từ AI. Vui lòng thử lại sau.';
  } catch (error) {
    console.error('❌ Lỗi chạy phân tích đánh giá AI:', error);
    return '❌ Lỗi hệ thống trong quá trình gọi AI phân tích dữ liệu.';
  }
};

module.exports = { generateBotResponse, analyzeReviews };
