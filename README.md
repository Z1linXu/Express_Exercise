
# CRUD Operations with Node.js and Express
Base on the practice project, I learned how to create a Friend's list using Express server.

This Application allow to add a friend with the following details: `First name`, `Last name`, `Email` and `Date of birth`.

## Objectives:
* Create API endpoints to perform Create, Retrieve, Update and Delete operations on transient data with an Express server.
* Implement authentication at the session level using JSON Web Tokens (JWT) for authorized access.

## Exercise:

**Exercise1: Implement the endpoints**
1. First add an API endpoint, using the get method for getting the details of all users.





```
// GET request: Retrieve all users
router.get("/",(req,res)=>{
    res.send(JSON.stringify({users},null,4));
});
```


2. Test: `curl localhost:5000/user/`


**Creating a GET by specific email method:**

1. Implement a get method for getting the details of a specific user based on their email ID by using the `filter` method on the user collection.


  ```
  // GET by specific ID request: Retrieve a single user with email ID
router.get("/:email",(req,res)=>{
    const email = req.params.email;
    let filtered_users = users.filter((user) => user.email === email);
    res.send(filtered_users);
});
 ```


2. Test: `curl localhost:5000/user/johnsmith@gamil.com`


**Creating the POST method:**

1. Use `push` to add the dictionary into the list of users. The user details can be passed as query paramters named firstName, lastName, DOB and email.


  ```
  // POST request: Create a new user
router.post("/",(req,res)=>{
    users.push({"firstName":req.query.firstName,"lastName":req.query.lastName,"email":req.query.email,"DOB":req.query.DOB});
    res.send("The user" + (' ')+ (req.query.firstName) + " Has been added!")
});
  ```
2. Test: `curl --request POST 'localhost:5000/user?firstName=Jon&lastName=Lovato&email=jonlovato@theworld.com&DOB=10/10/1995'`
   then `curl localhost:5000/user/jonlovato@theworld.com`

**Creating the POST method: Update the details of a user by email ID**

  ```
  // PUT request: Update the details of a user by email ID
router.put("/:email", (req, res) => {
    const email = req.params.email;
    let filtered_users = users.filter((user) => user.email === email);
    if (filtered_users.length > 0) {
        let filtered_user = filtered_users[0];
        let DOB = req.query.DOB;
        //if the DOB has changed
        if(DOB) {
            filtered_user.DOB = DOB
        }
        /*
        Include code here similar to the one above for other attibutes
        */
        users = users.filter((user) => user.email != email);
        users.push(filtered_user);
        res.send(`User with the email  ${email} updated.`);
    }
    else{
        res.send("Unable to find user!");
    }
});
   ```
2.Test: `curl --request PUT 'localhost:5000/user/johnsmith@gamil.com?DOB=1/1/1971'`
then `curl localhost:5000/user/johnsmith@gamil.com`



**Creating the DELETE method:**

  ```

// DELETE request: Delete a user by email ID
router.delete("/:email", (req, res) => {
    const email = req.params.email;
    users = users.filter((user) => user.email != email);
    res.send(`User with the email  ${email} deleted.`);
});
```
2. Test: `curl --request DELETE 'localhost:5000/user/johnsmith@gamil.com'`


## Implementing Authentication
**This tells your express app to use the session middleware.**


`app.use(session({secret:"fingerprint",resave: true, saveUninitialized: true}))`



* `secret` - a random unique string key used to authenticate a session.
* `resave` - takes a Boolean value. It enables the session to be stored back to the session store, even if the session was never modified during the request.
* `saveUninitialized` - this allows any uninitialized session to be sent to the store. When a session is created but not modified, it is referred to as uninitialized.

**Implementation of the login endpoint. A user logs into the system providing a username. An access token that is valid for one hour is generated.This access token is set into the session object to ensure that only authenticated users can access the endpoints for that length of time.**
```
app.post("/login", (req,res) => {
    const user = req.body.user;
    if (!user) {
        return res.status(404).json({message: "Body Empty"});
    }
    let accessToken = jwt.sign({
        data: user
      }, 'access', { expiresIn: 60 * 60 });//signifies the time in seconds.An access token that is valid for one hour is generated. 

      req.session.authorization = {
        accessToken
    }
    return res.status(200).send("User successfully logged in");
});
```

**All the endpoints starting with /user will go through this middleware. It will retrieve the authorization details from the session and verify it. If the token is validated, the user is authenticated and the control is passed on to the next endpoint handler. If the token is invalid, the user is not authenticated and an error message is returned.**
  ```
  app.use("/user", (req,res,next)=>{
// Middleware which tells that the user is authenticated or not

   if(req.session.authorization) {
       let token = req.session.authorization['accessToken']; // Access Token

       jwt.verify(token, "access",(err,user)=>{
           if(!err){
               req.user = user;
               next();
           }
           else{
               return res.status(403).json({message: "User not authenticated"})
           }
        });
    } else {
        return res.status(403).json({message: "User not logged in"})
    }
});
```
