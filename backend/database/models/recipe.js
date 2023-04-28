const mongoose = require('mongoose');
const { Schema } = mongoose;

//Creating a new schema
const recipeFormSchema = new Schema({
  generalInfo: {
    author: {
      type: String,
      required: true
    },
    recipeTitle: {
      type: String,
      required: true
    },
    timeToCookHours: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[0-9]*$/.test(v);
        },
        message: props => `${props.value} is not a valid time to cook hours value!`
      }
    },
    timeToCookMinutes: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[0-9]*$/.test(v);
        },
        message: props => `${props.value} is not a valid time to cook minutes value!`
      }
    },
    description: {
      type: String,
      required: true
    },
    servings: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[0-9]*$/.test(v);
        },
        message: props => `${props.value} is not a valid servings value!`
      }
    },
    calories: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[0-9]*$/.test(v);
        },
        message: props => `${props.value} is not a valid calories value!`
      }
    },
    link: {
      type: String,
      validate: {
        validator: function(v) {
          // Implement the urlValidator logic here
          return true;
        },
        message: props => `${props.value} is not a valid link value!`
      }
    },
    createdAt: {
      type: Date,
      required: true
    }
  },
  ingredients: [{
    ingredientName: {
      type: String,
      required: true
    },
    quantity: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d+(\.\d{1,2})?$/.test(v);
        },
        message: props => `${props.value} is not a valid quantity value!`
      }
    },
    unit: {
      type: String,
      required: true
    }
  }],
  steps: [{
    step: {
      type: String,
      required: true
    }
  }],
  pictures: [{
    picture: {
      type: String,
      required: true
    },

    newFileName: {
      type: String,
      required: true
    }
  }]
});


//Exporting it to the collection named recipes
module.exports = mongoose.model('recipes', recipeFormSchema);
