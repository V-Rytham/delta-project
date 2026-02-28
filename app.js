// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const User = require("./Models/user.js");

const app = express();
const PORT = process.env.PORT || 8080;

/* ========================
   ENV VALIDATION
======================== */

if (!process.env.ATLAS_DB_URL) {
    throw new Error("ATLAS_DB_URL is not defined");
}

if (!process.env.SECRET) {
    throw new Error("SECRET is not defined");
}

const dbUrl = process.env.ATLAS_DB_URL;

/* ========================
   DATABASE + SERVER START
======================== */

async function main() {
    await mongoose.connect(dbUrl);
    console.log("DB connected");

    if (process.env.NODE_ENV === "production") {
        app.set("trust proxy", 1); // Required for secure cookies behind proxy
    }

    const store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret: process.env.SECRET,
        },
        touchAfter: 24 * 3600,
    });

    store.on("error", (err) => {
        console.log("Session store error:", err);
    });

    app.use(
        session({
            store,
            secret: process.env.SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            },
        })
    );

    /* ========================
       PASSPORT CONFIG
    ======================== */

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    /* ========================
       FLASH + LOCALS
    ======================== */

    app.use(flash());

    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
    });

    /* ========================
       EXPRESS CONFIG
    ======================== */

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.engine("ejs", ejsMate);

    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.use(express.static(path.join(__dirname, "public")));

    /* ========================
       ROUTES
    ======================== */

    app.get("/", (req, res) => res.send("Root Page"));

    app.use("/listings", listings);
    app.use("/listings/:id/reviews", reviews);
    app.use("/user", userRouter);

    /* ========================
       404 HANDLER
    ======================== */

    app.use((req, res, next) => {
        next(new ExpressError(404, "Page not Found"));
    });

    /* ========================
       ERROR HANDLER
    ======================== */

    app.use((err, req, res, next) => {
        const { statusCode = 500, message = "Something went wrong" } = err;
        res.status(statusCode).send(message);
    });

    /* ========================
       START SERVER
    ======================== */

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
}

main().catch((err) => {
    console.error("Startup error:", err);
});