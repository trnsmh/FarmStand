const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");

///// importing Model Schema file
const Product = require("./models/product");

///// Open connection to mongoDB  // in order to open connection powershell should be open and "mongod" should be executed beforehand.
mongoose
  .connect("mongodb://localhost:27017/farmStand", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!");
  })
  .catch((err) => {
    console.log("CAN'T CONNECT DATABASE");
    console.log(err);
  });

////// express functions to execute from any directory and setting ejs as templating engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//////this is a middleware function to have access to req.body() data
app.use(express.urlencoded({ extended: true }));
//////this is another middleware to use different methods in the form
app.use(methodOverride("_method"));

//////to use option menu effectively
const categories = ["fruit", "vegetable", "dairy", "fungi", "baked", "jam"];

/////////////// ROUTES ///////////////
app.get("/products", async (req, res) => {
  const { category } = req.query;
  if (category) {
    const products = await Product.find({ category });
    res.render("products/index", { products, category });
  } else {
    const products = await Product.find({});
    res.render("products/index", { products, category: "All" });
  }
});

app.get("/products/new", (req, res) => {
  res.render("products/new", { categories });
});

app.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.redirect(`products/${newProduct._id}`);
});

app.get("/products/:id", async (req, res) => {
  const { id } = req.params; //
  const product = await Product.findById(id);
  res.render("products/show", { product });
});

app.get("/products/:id/edit", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("products/edit", { product, categories });
});

app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  //this part is the logic to update info (we can also update each piece manually by
  ////await Product.findById(id)
  ////product.name = req.body.name,
  ////product.price = req.body.price )
  // this is the legit way of updating the product
  const product = await Product.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  res.redirect(`/products/${product._id}`);
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.redirect("/products");
});

//////// OPEN LOCAL SERVER PORT ///////////
app.listen(3000, () => {
  console.log("APP IS LISTENING ON PORT 3000");
});
