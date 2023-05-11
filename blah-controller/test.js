const pactum = require("pactum");

// Base API route
it("API should be active", async () => {
    await pactum
        .spec()
        .get("http://localhost:3000/")
        .expectStatus(200)
});

// Signup route
it("Existing users should not be able to sign up again", async () => {
    await pactum
        .spec()
        .post("http://localhost:3000/auth/register")
        .withBody({
            "email_id" : "demo@email.com",
            "password" : "demo"
        })
        .expectStatus(403)
});

// Login route
it("Valid users should be able to log in", async () => {
    await pactum
        .spec()
        .post("http://localhost:3000/auth/login")
        .withBody({
            "email_id" : "demo@email.com",
            "password" : "demo"
        })
        .expectStatus(200)
});

it("Invalid users should not be able to log in", async () => {
    await pactum
        .spec()
        .post("http://localhost:3000/auth/login")
        .withBody({
            "email_id" : "demo@email.com",
            "password" : "demo_wrong_password"
        })
        .expectStatus(403)
});

// MongoDB fetch data
it("Mongo: Fetch reviews", async () => {
    await pactum
        .spec()
        .get("http://127.0.0.1:3000/reviews/fetch")
        .withBody({
                "movie_id" : "tt3896198"
        })
        .expectStatus(200)
});