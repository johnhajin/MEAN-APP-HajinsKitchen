const express = require('express');
const app = express();
const path  = require('path');

//Connecting the database
const mongoose = require('./database/mongoose');
require('dotenv').config();
//Connecting the models
const Recipe = require('./database/models/recipe');
//Connecting multer / setting it up
const multer = require('multer');
const User = require('./database/models/user');

const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    const uploads = path.join(__dirname, '../frontend/src/assets/uploads');
    cb(null, uploads);
  },

  //New file name so that they dont overwrite
  filename: (req, file, cb) => {
    const fileName = Date.now() + "_" + file.originalname;
    console.log('New file name:', fileName);
    cb(null, fileName);
  }
})

const storage2 = multer.diskStorage({
  destination: (req, file, cb) =>{
    const uploads = path.join(__dirname, '../frontend/src/assets/profilepics');
    cb(null, uploads);
  },

  //New file name so that they dont overwrite
  filename: (req, file, cb) => {
    const fileName = Date.now() + "_" + file.originalname;
    console.log('New file name:', fileName);
    cb(null, fileName);
  }
})

const upload = multer({storage: storage});
const upload2 = multer({storage: storage2});

//const upload = multer({dest: 'uploads'});

//Middleware
//Parsing JSON Data
app.use(express.json());
//CORS - any allowed with the get post delete update put patch
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
  

//Recipe: Create, Update, ReadOne, ReadAll, Delete

//Gets all of the recipes
app.get('/AllRecipes' , (req, res)=>{
    Recipe.find({})
        .then(recipes => res.send(recipes))
        .catch((error) => console.log(error));

});

app.get('/recipes/search', (req, res) => {
  const keyword = req.query.keyword;
  Recipe.find({ 'generalInfo.recipeTitle': { $regex: keyword, $options: 'i' } })
    .then(recipes => res.send(recipes))
    .catch(error => console.log(error));
});

//Gets 12 random recipes
app.get('/tenRandomRecipes', (req, res) => {
  Recipe.aggregate([{ $sample: { size: 12 } }])
    .then(recipes => res.send(recipes))
    .catch(error => console.log(error));
});

app.get('/userRecipes', (req, res) => {
  const author = req.query.author;
  Recipe.find({ 'generalInfo.author': author })
      .then(recipes => res.send(recipes))
      .catch(error => console.log(error));
});
//Get Recipe by ID
// Gets a recipe by ID

app.get('/GetRecipeByID', (req, res) => {
  Recipe.findById(req.query.id)
    .then(recipe => {
      if (!recipe) {
        return res.status(404).send({ message: "Recipe not found" });
      }
      res.send(recipe);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({ message: "Internal server error" });
    });
});

//Delete Recipe
app.delete('/deleteRecipe', (req, res) => {
  const recipeId = req.query.id;
  Recipe.findByIdAndDelete(recipeId)
    .then(recipe => {
      if (!recipe) {
        return res.status(404).send({ message: "Recipe not found" });
      }
      res.send({ message: "Recipe deleted successfully" });
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({ message: "Internal server error" });
    });
});


//Posts a recipe
app.post('/PostRecipe',(req, res) => {
    const formData = req.body;
    const newRecipe = new Recipe({
      generalInfo: formData.generalInfo,
      ingredients: formData.ingredients,
      steps: formData.steps,
      pictures: formData.pictures
    });
  
    newRecipe.save()
      .then((recipe) => res.send(recipe))
      .catch((error) => console.log(error));
  });

  app.post('/RegisterUser',(req, res) => {
    const formData = req.body;
    const newUser = new User({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      newFileName: formData.newFileName
    });
  
    newUser.save()
      .then((newUser) => res.send(newUser))
      .catch((error) => res.send(error));
  });

  app.post('/UploadPictures',upload.array('file'),(req, res) => {
    const file = req.files;
    if(Array.isArray(file) && file.length > 0){
      console.log(file);
      res.json(file);
    }
    
    else{
      throw new Error("File upload unsuccessful");
    }
  });

  app.post('/UploadProfPic',upload2.array('file'),(req, res) => {
    const file = req.files;
    if(Array.isArray(file) && file.length > 0){
      console.log(file);
      res.json(file);
    }
    
    else{
      throw new Error("File upload unsuccessful");
    }
  });
  
  app.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email })
      .exec()
      .then(user => {
        if (!user) {
          return res.status(401).json({
            message: 'Authentication failed'

          });
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: 'Authentication failed'
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user.email,
                _id: user._id,
                username: user.username,
                newFileName : user.newFileName
              },
              process.env.JWT_KEY,
              {
                expiresIn: '2h'
              }
            );
            return res.status(200).json({
              message: 'Authentication successful',
              token: token
            });
          }
          res.status(401).json({
            message: 'Authentication failed'
          });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

  //Get username given id
  app.get('/username', (req, res) => {
    const userId = req.query.id;
  
    User.findById(userId)
      .then((user) => {
        if (user) {
          res.status(200).json({ username: user.username });
        } else {
          res.status(404).send('User not found');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error retrieving user');
      });
  });

  app.get('/UserProfPic', (req, res) => {
    const userId = req.query.id;
  
    User.findById(userId)
      .then((user) => {
        if (user) {
          res.status(200).json({ newFileName: user.newFileName });
        } else {
          res.status(404).send('User not found');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error retrieving user');
      });
  });
  
  module.exports = router;
  
//Showing if connection is succesful
app.listen(3000, () => console.log("Server Connected on port 3000"))