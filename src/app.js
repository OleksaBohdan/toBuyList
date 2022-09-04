const Koa = require('koa');
const Router = require('koa-router');
const path = require('path');
const Product = require('./models/Product');
const User = require('./models/User');
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

router.get('/register', async (ctx, next) => {
  await ctx.render('registration', true);
});

router.post('/register', async (ctx, next) => {
  const user = {
    email: ctx.request.body.email,
    password: ctx.request.body.password,
  };

  try {
    const u = new User(user);
    await u.setPassword(user.password);
    await u.save();
    ctx.redirect('/login');
  } catch (err) {
    let errMesaage = '';
    if (err.code == 11000) {
      errMesaage = 'This email already exist!';
    } else if (err.errors.email.properties.type == 'required') {
      console.log('kind', err.errors.email.properties.type);
      errMesaage = 'E-mail cannot be empty!';
    } else {
      errMesaage = err.message;
    }
    let error = {
      err: errMesaage,
    };
    pug.locals = error;
    await ctx.render('registration', true);
  }
});

router.get('/login', async (ctx, next) => {
  ctx.body = 'login';
  await ctx.render('login', true);
});

router.post('/login', async (ctx, next) => {
  ctx.body = 'login';
  await ctx.render('login', true);
});

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
