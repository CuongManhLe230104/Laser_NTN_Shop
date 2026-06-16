const adminRoutes = require('./src/routes/admin.routes');
console.log("=== Admin Routes ===");
adminRoutes.stack.forEach(layer => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
    console.log(`${methods} ${layer.route.path}`);
  } else if (layer.name === 'router') {
    console.log(`Router middleware: ${layer.handle}`);
  } else {
    console.log(`Middleware: ${layer.name}`);
  }
});
