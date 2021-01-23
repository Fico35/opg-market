# ***API docs***

## **AUTH**

### POST `/login`
> Checks credentials with given `username` and `password`. If credentials match, creates a session on the server and returns information about the session (such as the session ID) to the client.
>- ***Fields required:*** `username`, `password`
>- ***Returns:***
>   - **200:** `{sid, expires, user_id}` on successful login
>   - **400:** `"Missing input for 'xxxxx'"` on missing `username`, `password` field
>   - **401:** `"Username doesn't exist"` on unexisting `username`
>   - **401:** `"Incorrect password!"` on `password` that doesn't match to the `username`
>   - **500:** on error when querying database

### POST `/register`
> Creates a new user with given `username`, `password` and `opg_name`. Also logs in the user and returns information about the login session.
>- ***Fields required:*** `username`, `password`, `opg_name`
>- ***Returns:***
>   - **200:** `{sid, expires, user_id}` on successful register and login
>   - **400:** `"Missing input for 'xxxxx'"` on missing `username`, `password` or `opg_name` field
>   - **403:** `"Username already exists!"` on duplicate `username`
>   - **500:** on error when querying database

### POST `/logout`
> Deletes the session with given `sid` on the server, which means user must log in again if they want to take any further actions.
>- ***Fields required:*** `sid`
>- ***Returns:***
>   - **200:** `"Logged out"` on success
>   - **400:** `"Missing session ID ('sid' field in request body)"` on missing `sid` field
>   - **500:** on error when querying database

---
## ***! IMPORTANT !***
## **ALL** further requests
require proper authorization in the form of a `sid` field in the body of the request. If the authorization is unsuccessful, the following results may occur:
>- ***Fields required:*** `sid`
>- ***Returns:***
>   - **400:** `"Missing session ID ('sid' field in request body)"` on missing `sid` field
>   - **401:** `"Session ID is not valid"` if value of `sid` is not valid
>   - **401:** `"Session has expired"` if value of `sid` is in the sessions map, but is no longer valid

It is also possible that an error occurs when querying the database, in which case and empty *500* response is sent back to the client:

>   - **500:** on error when querying database

---

## **USER**

### GET `/users`
> Returns all users.
>- ***Fields required:*** none
>- ***Returns:***
>   - **200:** `[all users]` on success

### GET `/user/:id/vegetables`
> Returns all vegetables of the user whose ID matches `:id`.
>- ***Fields required:*** none
>- ***Returns:***
>   - **200:** `[all vegetables of user with :id]` on success

### GET `/user/:id/services`
> Returns all services of the user whose ID matches `:id`.
>- ***Fields required:*** none
>- ***Returns:***
>   - **200:** `[all services of user with :id]` on success

---

## **VEGETABLE**

### GET `/vegetables`
> Returns all vegetables.
>- ***Fields required:*** none
>- ***Returns:***
>   - **200:** `[all vegetables]` on success

### POST `/vegetable`
> Creates a new vegetable in the database with given `name`, `amount` and `cost`. The database automatically generates the ID. Returns the newly created vegetable, including the ID.
>- ***Fields required:*** `name`, `amount`, `cost`
>- ***Returns:***
>   - **200:** `{created vegetable}` on success
>   - **400:** `"Missing input for 'xxxxx'"` on missing `name`, `amount` or `cost` field

### GET `/vegetable/:id`
> Returns the vegetable whose ID matches `:id`.
>- ***Fields required:*** none
>- ***Returns:***
>   - **200:** `{vegetable with :id}` on success
>   - **404:** `"Vegetable with ID :id not found"` if no `{vegetable}` with given `:id` exists in database

### PUT `/vegetable/:id`
> Updates the vegetable whose ID is `:id` with given `name`, `amount` and `cost` (if the vegetable belongs to the current user).
>- ***Fields required:*** `name`, `amount`, `cost`
>- ***Returns:***
>   - **200:** `"Vegetable with ID :id updated"` on success
>   - **400:** `"Missing input for 'xxxxx'"` on missing `name`, `amount` or `cost` field
>   - **403:** `"Not allowed to update vegetable of another user"` if vegetable doesn't belong to user that made the request
>   - **404:** `"Vegetable with ID :id not found"` if no `{vegetable}` with given `:id` exists in database

### DELETE `/vegetable/:id`
> Deletes the vegetable whose ID matches `:id` (if the vegetable belongs to the current user).
>- ***Fields required:*** none
>- ***Returns:***
>   - **200:** `"Vegetable with ID :id deleted"` on success
>   - **403:** `"Not allowed to delete vegetable of another user"` if vegetable doesn't belong to user that made the request
>   - **404:** `"Vegetable with ID :id not found"` if no `{vegetable}` with given `:id` exists in database

---

## **SERVICE**

### GET `/services`
> Returns all services.
>- ***Fields required:*** none
>- ***Returns:***
>   - **200:** `[all services]` on success

### POST `/service`
> Creates a new service in the database with given `name`, `description` and `cost`. The database automatically generates the ID. Returns the newly created service, including the ID.
>- ***Fields required:*** `name`, `description`, `cost`
>- ***Returns:***
>   - **200:** `{created service}` on success
>   - **400:** `"Missing input for 'xxxxx'"` on missing `name`, `description` or `cost` field

### GET `/service/:id`
> Returns the service whose ID matches `:id`.
>- ***Fields required:*** none
>- ***Returns:***
>   - **200:** `{service with :id}` on success
>   - **404:** `"Service with given ID not found"` if no `{service}` with given `:id` exists in database

### PUT `/service/:id`
> Updates the service whose ID is `:id` with given `name`, `description` and `cost` (if the service belongs to the current user).
>- ***Fields required:*** `name`, `description`, `cost`
>- ***Returns:***
>   - **200:** `"Service with ID :id updated"` on success
>   - **400:** `"Missing input for 'xxxxx'"` on missing `name`, `description` or `cost` field
>   - **403:** `"Not allowed to update service of another user"` if service doesn't belong to user that made the request
>   - **404:** `"Service with ID :id not found"` if no `{service}` with given `:id` exists in database

### DELETE `/service/:id`
> Deletes the service whose ID matches `:id` (if the service belongs to the current user).
>- ***Fields required:*** none
>- ***Returns:***
>   - **200:** `"Service with ID :id deleted"` on success
>   - **403:** `"Not allowed to delete service of another user"` if service doesn't belong to user that made the request
>   - **404:** `"Service with ID :id not found"` if no `{service}` with given `:id` exists in database
