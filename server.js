if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const express = require("express");
const bcrypt = require("bcrypt");
const initializePassport = require("./passport-config");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const res = require("express/lib/response");
const methodOverride = require("method-override");
const app = express();

initializePassport(
	passport,
	(email) => users.find((user) => user.email === email),
	(id) => users.find((user) => user.id === id)
);

// mock data
const users = [];

// to use ejs sintax
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false })); //take forms and get access to them through request from post
app.use(flash());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
	res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
	res.render("login.ejs");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
	res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		users.push({
			id: Date.now().toString(),
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword,
		});
		res.redirect("/login");
	} catch (error) {
		console.log(error);
		res.redirect("/register");
	}
	console.log(users);
});

app.post(
	"/login",
	checkNotAuthenticated,
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/login",
		failureFlash: true,
	})
);

app.delete("/logout", (req, res) => {
	req.logOut(); // passport is setting this method
	res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		// passport is setting isAuthenticated method
		return res.redirect("/");
	}
	next();
}

app.listen(3000, () => console.log("server started at 3000"));
