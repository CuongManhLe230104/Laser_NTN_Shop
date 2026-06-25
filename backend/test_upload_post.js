const email = 'admin@laserntn.vn';
const password = 'Admin@123';

async function test() {
  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('Login failed:', loginData);
      return;
    }
    const token = loginData.token;
    console.log('Logged in successfully, token:', token.substring(0, 20) + '...');

    // 2. Perform POST request to /api/admin/upload-multiple
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const bodyParts = [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="images"; filename="test.png"\r\n`,
      `Content-Type: image/png\r\n\r\n`,
      `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\r\n`,
      `--${boundary}--\r\n`
    ];
    const multipartBody = bodyParts.join('');

    console.log('Sending upload request...');
    const uploadRes = await fetch('http://localhost:3000/api/admin/upload-multiple', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: multipartBody
    });

    console.log('Status:', uploadRes.status);
    const uploadData = await uploadRes.json();
    console.log('Data:', uploadData);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
