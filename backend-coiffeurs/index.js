// index.js
/*const app = require('./app');


*/


require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');
const stripeWebhook = require('./routes/stripeWebhook');
app.use('/webhook', stripeWebhook);
const dashboardRoutes = require('./routes/dashboard');
const reviewRoutes = require('./routes/reviews');
const availRoutes = require('./routes/availabilities');
const specificAvailRoutes = require('./routes/specificAvailabilities');
const adminRoutes = require('./routes/admin');
app.use('/uploads', express.static('uploads'));
const uploadRoutes = require('./routes/uploads');
app.use('/upload', uploadRoutes);
const blogRoutes = require('./routes/blog');
const productRoutes = require('./routes/products');
const galleryRoutes = require('./routes/gallery');
const pdfRoutes = require('./routes/pdf');
const newsletterRoutes = require('./routes/newsletter');
const newsletterLogsRoutes = require("./routes/newsletterLogs");
const mapRoutes = require('./routes/map');
const reportRoutes = require('./routes/reports');



app.use(express.json());
app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);
app.use('/bookings', bookingRoutes);
app.use('/messages', messageRoutes);
app.use('/payments', paymentRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reviews', reviewRoutes);
app.use('/availabilities', availRoutes);
app.use('/specific-availabilities', specificAvailRoutes);
app.use('/admin', adminRoutes);
app.use('/blog', blogRoutes);
app.use('/products', productRoutes);
app.use('/gallery', galleryRoutes);
app.use('/pdf', pdfRoutes);
app.use('/newsletter', newsletterRoutes);
app.use("/newsletter-logs", newsletterLogsRoutes);
app.use('/map', mapRoutes);
app.use('/reports', reportRoutes);

const ordersRoutes = require('./routes/orders');
app.use("/orders", ordersRoutes);
const { swaggerUi, swaggerSpec } = require('./swagger');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
  }
module.exports = app;
