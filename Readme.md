# Summary of this project

This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, mongodb pipelines and many more. This project is a complete backend project that has all the features that a backend project should have. We are building a complete video hosting website similar to youtube with all the features like login, signup, upload video, like, dislike, comment, reply, subscribe, unsubscribe, and many more.

Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more. We have spent a lot of time in building this project and we are sure that you will learn a lot from this project.

## In this project i had created various models and controllers like :-

### User : 
We had created user model and controller in this we used bcrypt for encyption and decription of password. Used json webtoken for creating accessToken and refreshToken. Applied full CRUD functionality while       handling edge cases. Used mongoose pipeline to count the subscribers of channels. Use cloudinary to upload user avatar and cover image.

### Video : 
In this we have use cloudinary to upload videos. Add functionality to delete and update also. Uses tokens to check whether user is allowed to update or delete video. I also used pagination in videos.

### Subscription :
This is one of the interisting model. In this we have two fields subscriber and channel. As the name suggest subscriber is the person who is subscribing and channel is the channel . and by using pipelines we can easily calculate the both subscriers and subscribed to for a paricular user. The idea here to store them in this object manner if we used an aary insted then it will be very time consuming to edit subscriptions.

### Tweet :
In this a user can add, delete or update tweets. And an unauzhorized user can only see the tweets of other users.

### Playlist :
This is also simialr to youtube playlist and channel owner can create a playlist of these video which playlist title and discription.

### Like :
By use of this one can toggle like of any tweet, video or comments.

### Comment :
By this one can comment of any video just like we comment on youtube video etc.









