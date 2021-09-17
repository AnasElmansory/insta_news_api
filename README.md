# Insta News Api

* Overview
* Files
* Dependencies

## Overview
nodejs application that fetch data from **Twitter API** and store them in mongo database.

## Files
`src` contains typescript files  
&nbsp;&nbsp;`authentication` authentication logic.  
&nbsp;&nbsp;&nbsp;&nbsp;`auth.ts` contains helper functions and middlewares.  
&nbsp;&nbsp;&nbsp;&nbsp;`google_auth.ts` google authentication logic, verify that user is authenticated by google.  
&nbsp;&nbsp;&nbsp;&nbsp;`facebook_auth.ts` facebook authentication logic, verify that user is Authenticated by facebook.  

&nbsp;&nbsp;`models` folder contains all data classes or mongoose schemas.  
&nbsp;&nbsp;&nbsp;&nbsp; `user.ts` `admin.ts`  
&nbsp;&nbsp;&nbsp;&nbsp; `source.ts` represents Twitter user as news (tweets) provider.  
&nbsp;&nbsp;&nbsp;&nbsp; `news.ts` news represents single tweet from Twitter API.  
&nbsp;&nbsp;&nbsp;&nbsp; `country.ts` country used to categorize news (tweets).  
&nbsp;&nbsp;&nbsp;&nbsp; `notification_topic.ts` notification topic that user can subscribe to to get notifications.  
&nbsp;&nbsp;&nbsp;&nbsp; `favorites.ts` user favorite news.  
&nbsp;&nbsp;&nbsp;&nbsp; `follow_source.ts` contains user followed sources (Twitter users).  

&nbsp;&nbsp; `utils` contains helper functions and Twitter fetch logic.  
&nbsp;&nbsp; `endpoints` app endpoints to get news, sources and favorite news.  
&nbsp;&nbsp; `notification` contains functions to subscribe and unsubscribe to topics _**but not yet tested**_.  

&nbsp;&nbsp; `interfaces.ts` application interfaces and types.  
&nbsp;&nbsp; `app.ts` node (express) app entry points.  

## Dependencies 
`express`  
`firebase admin`  
`cors` for cross origin requests.  
`twitter-api-v2`  
`mongoose` connects to mongodb.  
`google-auth-library`  
`axios` make ajax request to verify facebook users.  

