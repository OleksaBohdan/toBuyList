const Koa = require('koa');
const Router = require('koa-router');
const path = require('path');
const Product = require('./models/Product');
const Pug = require('koa-pug');

const app = new Koa();
app.use(require('koa-bodyparser')());
app.use(require('koa-static')(path.join(__dirname, 'public')));

const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  locals: {},
  basedir: 'path/for/pug/extends',
  app: app,
});

const router = new Router();

router.get('/', async (ctx) => {
  const buyList = await Product.find({});
  let menu = {
    title: 'Menu',
    isMenu: true,
    buyList: buyList,
  };

  pug.locals = menu;
  await ctx.render('index', true);
});

router.get('/create', async (ctx) => {
  let create = {
    title: 'Create',
    isCreate: true,
  };
  pug.locals = create;
  await ctx.render('create', true);
});

router.post('/create', async (ctx, next) => {
  const productName = ctx.request.body.productName;
  const productCount = ctx.request.body.productCount;
  console.log(productName);
  if (productName != '') {
    await Product.create({ productName: productName, productCount: productCount });
  }
  ctx.redirect('/');
});

router.post('/complete', async (ctx, next) => {
  const id = ctx.request.body.id;
  console.log(id);
  const product = await Product.findById(id);
  if (product.isBuyed == true) {
    product.isBuyed = false;
  } else if (product.isBuyed == false) {
    product.isBuyed = true;
  }

  await product.save();

  ctx.redirect('/');
});

router.get('/clear', async (ctx, next) => {
  await Product.deleteMany();
  ctx.redirect('/');
});

app.use(router.routes());

module.exports = app;
