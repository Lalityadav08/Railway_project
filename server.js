const express = require('express');
const bodyParser = require('body-parser');
const formController = require('./controllers/formController');
const adminController = require('./controllers/adminController');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const mysql = require('mysql2');
const MySQLStore = require('express-mysql-session')(session);
const flash = require('express-flash'); 
const bcrypt = require('bcrypt');
const formModel = require('./models/formModel');
const app = express();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');


const port = 3000; 

// Middleware to parse incoming request data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const connection = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Devansh@2010',
  database: 'point_crossing',
  keepAlive: true
});

const sessionStore = new MySQLStore({
  expiration: 24 * 60 * 60 * 1000, 
  createDatabaseTable: true,
  schema: {
    tableName: 'user_sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires_at',
      data: 'data'
    }
  }
}, connection);



const fileFilter = (req, file, cb)=> {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpeg'||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb (null, false);
  }
};

const fileStorage =multer.diskStorage({
  destination:(req,file,cb) =>{
    cb(null, 'imageInput')
  },
  filename :(req, file, cb) =>{
    cb(null, new Date().toISOString() + '-' + file.originalname );
  }
});
app.use(multer({storage: fileStorage}).single('imageInput'))

// Set up the 'views' folder to use EJS templates
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use('/imageInput', express.static('imageInput'));

// Session middleware

// app.use(
//   session({
//     secret: 'Himanshu', // Replace with a strong secret key
//     resave: false,
//     saveUninitialized: false,
//     cookie: { 
//       secure: false, // Set "secure: true" if using HTTPS
//       maxAge: 24 * 60 * 60 * 1000 // Session duration in milliseconds (24 hours)
//     },
//   })
// );

app.use(session({
  secret: 'Himanshu', // Replace with a strong secret key
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // Session duration in milliseconds (24 hours)
  },
}));

// Initialize Passport and restore authentication state, if any
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


  
passport.serializeUser((user, done) => {
    done(null, user.ID);
});

passport.deserializeUser((ID,done) => {
  formModel.findUserById(ID, (err, user) => {
    if (err) {
      done(err);
    }
    done(null,user);
  });
});

// Login route

passport.use(new LocalStrategy((username, password, done) => {
  formModel.findUserByUsername(username, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    formModel.comparePasswords(password, user.hashedPassword, (err, result) => {
      if (err || !result) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      // No need to manually handle sessions here
      return done(null, user);
    });
  });
}));

app.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') });
});

// Handle login form submission
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  })
);


// Authentication middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
  
  if (req.isAuthenticated()) {

    return next();
  }
  return res.status(403).send('Access Denied')
}

function isSignalEngineer(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user && req.user.preferences === 'Signal') {
      return next(); // User is an engineer, grant access
    }
 } 
    return res.status(403).send('Access Denied');
}

function isAdminEngineer(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user && req.user.preferences === 'Admin') {
      return next(); // User is an engineer, grant access
    }
 } 
    return res.status(403).send('Access Denied');
}

function isEngineer(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user && req.user.preferences === 'ENG') {
      return next(); // User is an engineer, grant access
    }
 } 
    return res.status(403).send('Access Denied');
}

function isBothEngineerTypes(req, res, next) {
  if (req.isAuthenticated()) {
    return next();

    // if (req.user &&(req.user.preferences === 'Signal' || req.user.preferences === 'ENG')) {
    //   return next(); // User is either a signal engineer or an engineer, grant access
    // }
 } 
  return res.status(403).send('Access Denied');
}


// Route to display the protected entry form page
app.get('/entry-form', isSignalEngineer, (req, res) => {
  formController.displayForm(req, res);
});

app.get('/stationGearForm', isSignalEngineer, (req, res) => {
  formController.displayStationGearWiseForm(req, res);
});

app.get('/gear-entry-form', ensureAuthenticated, (req, res) => {
    formController.displayForm2(req, res);
  });

app.get('/compliance-entry', isEngineer, (req, res) => {
    formController.complianceEntry(req, res);
});


// Route for handling form submission and fetching data for the table 
// route for fetching data od complaince table
app.post('/updateSearch', formController.updateSearch);

// Route for handling data update from SweetAlert
app.post('/updateData', formController.updateData);

// route for acknowledge

app.get('/acknowledge-details', isSignalEngineer, (req, res) => {
  formController.acknowledgeDetails(req, res);
});
// Route for handling form submission and fetching data for the Acknowledge table
app.post('/acknowledge', formController.updateAcknowledge);
// Route for handling data update from SweetAlert(Acknowledge Review)
app.post('/addAcknowledge', formController.updateAcknowledgeData);

app.get('/dasboardAnalysis', isBothEngineerTypes, (req, res) => {
  formController.dashboardAnalysis(req, res);
});

app.get('/analysis', isBothEngineerTypes, (req, res) => {
  formController.analysis(req, res);
});
app.post('/analysisData', formController.dashboardData);

app.get('/chartAnalysis', isBothEngineerTypes, (req, res) => {
  formController.chartAnalysis(req, res);
});

// donut, compliance and avrage chart data api 
app.post('/getDonutChartData', formController.getDonutChartData); 
app.post('/getLongPendingPerformanceData', formController.getLongPendingPerformanceData);
app.post('/getAverageComplianceTimeData', formController.getAverageComplianceTimeData);


app.get('/dashboard', isBothEngineerTypes, (req, res) => {
  formController.dashboard(req, res);
});
// Route to get main deficiency data 
app.get('/dashboard/data', formController.dashboardData);
// Route to get the long Pending defi data
app.get('/dashboard/longdefidata', formController.longPendingDefiData);
// Route to get repeated complaince data
app.get('/repeated/data', formController.repeatedCompliance);

// app.get('/Hyperlink',formController.hyperlinkDisplay);
app.get('/backend-endpoint', formController.hyperlinkData);

//Route to fetch options name selected in compliance entry
app.get('/fetchStationName/:option/:optionDetails',ensureAuthenticated,formController.fetchStationName);
//Route to fetch station names selected in compliance entry
app.get('/fetchOptionName/:option',ensureAuthenticated,formController.fetchOptionName);
// Route to fetch Gear options based on Station Name
app.get('/fetchGears/:stationName', ensureAuthenticated, formController.fetchGears);
//Route to fetch Zone options based on Station Name, Gear Type
app.get('/fetchZone/:stationName/:gearName',ensureAuthenticated,formController.fetchZone);
// Route to fetch GearID options based on Station Name and Gear
app.get('/fetchGearIDs/:stationName/:gear/:Zone/:Type/:date', ensureAuthenticated, formController.fetchGearIDs);
// Route to fetch GearID options based on Station Name and Gear
app.get('/fetchDeficiencies/:gear', ensureAuthenticated, formController.fetchDeficiencies);
// route to handle last entry date details
app.get('/fetchlastEntryDetails/:stationName/:gear/:Type/:Zone',ensureAuthenticated, formController.fetchLastDateDetails);
// Route to handle entry-form data saving to the database
app.post('/fetchGearIDs', ensureAuthenticated, formController.fetchGearIDs);
app.post('/saveForm', ensureAuthenticated, formController.saveFormData);
// Route to add new gear to the table_gear_wise
app.post('/addNewGear',ensureAuthenticated, formController.addNewGear);
// Route to add new Deficiency to the table_gear_wise
app.post('/addNewDeficiency',ensureAuthenticated, formController.addNewDeficiency);

app.post('/saveFormGear', ensureAuthenticated, formController.saveFormData2);

app.post('/performUpdate', ensureAuthenticated, formController.performUpdate);

app.get('/render-response',ensureAuthenticated, formController.renderResponseTable);


//Route for fetching existing GearID in the db for the station,zone,gear,gear_type
app.post('/existingGearID',ensureAuthenticated,formController.existingGearID);

//Admin Routes Deficiency Point
app.get('/deficiencyForm', isAdminEngineer, (req, res) => {
  adminController.dataUpdate(req, res);
});

//Admin Point Priority Deficiency
app.get('/pointPriorityForm', isAdminEngineer, (req, res) => {
  adminController.priorityUpdate(req, res);
});

//Admin Track Priority Deficiency
app.get('/trackPriorityForm', isAdminEngineer, (req, res) => {
  adminController.trackUpdate(req, res);
});

//Admin Deficiency Track
app.get('/deficiencyTrackForm', isAdminEngineer, (req, res) => {
  adminController.deficiencyTrack(req, res);
});

// Route to add new Point Priority Deficiency to the table_gear_wise
app.post('/prioritizePointDeficiency',ensureAuthenticated, adminController.addNewPriorityPointDeficiency);

// Route to add new Track Priority Deficiency to the table_gear_wise
app.post('/prioritizeTrackDeficiency',ensureAuthenticated, adminController.addNewPriorityTrackDeficiency);

//Admin Gear 
app.get('/gearForm', isAdminEngineer, (req, res) => {
  adminController.fetchGear(req, res);
});

//Admin Zone
app.get('/zoneForm', isAdminEngineer, (req, res) => {
  adminController.fetchZone(req, res);
});
//Admin gearTypeUpdate
app.get('/gearTypeForm', isAdminEngineer, (req, res) => {
  adminController.fetchGearType(req, res);
});
//Admin gearTypePointUpdate
app.get('/pointForm', isAdminEngineer, (req, res) => {
  adminController.fetchGearTypePoint(req, res);
});
//Admin trackCircuitUpdate
app.get('/trackCircuitForm', isAdminEngineer, (req, res) => {
  adminController.fetchGearTypeTrackCircuit(req, res);
});
//Admin userUpdate
app.get('/userForm', isAdminEngineer, (req, res) => {
  adminController.fetchUser(req, res);
});
//Admin update main entry date route
app.get('/updateDate', isAdminEngineer, (req, res) => {
  formController.updateDate(req, res);
});

//Admin update main_data  route
app.get('/updateStationData', isAdminEngineer, (req, res) => {
  formController.updateMainSheet(req, res);
});


//Admin Update Routes

//fetch station details 
app.post('/getStationDetails', ensureAuthenticated, adminController.getStationDetails);
//station-details update
app.post('/updateStation', adminController.updateStation)
//Gear Update
app.post('/updateGear', ensureAuthenticated, adminController.updateGear);
//Deficiency Update
app.post('/updateDeficieny', ensureAuthenticated, adminController.updateDeficiency);
//Priority Point Deficiency Update
app.post('/updateprioritizePointDeficiency', ensureAuthenticated, adminController.updatePointPriorityDeficiencies);
// deficiency track update 
app.post('/updateDeficienyTrack', ensureAuthenticated, adminController.updateDeficiencyTrack);
//Priority Track Deficiency Update
app.post('/updateprioritizeTrackDeficiency', ensureAuthenticated, adminController.updateTrackPriorityDeficiencies);
//Zone Update
app.post('/updateZone', ensureAuthenticated, adminController.updateZone);
//Gear Type Update
app.post('/updateGearType', ensureAuthenticated, adminController.updateGearType);
//Gear Type Point Update
app.post('/updateGearTypePoint', ensureAuthenticated, adminController.updateGearTypePoint);
//Gear Type Track Circuit Update
app.post('/updateGearTypeTrackCircuit', ensureAuthenticated, adminController.updateGearTypeTrackCircuit);
// User Update
app.post('/updateUser', ensureAuthenticated, adminController.updateUser);
// Update entry table data 
app.get('/fetchMainEntryData', ensureAuthenticated, formController.getMainEntryData);
// Update Date tabke data
app.post('/updateMainTableDate', ensureAuthenticated, formController.updateMainTableData);

//Admin Delete Routes

//Gear Delete
app.post('/deleteGear', ensureAuthenticated, adminController.deleteGear);
//Deficiency Delete
app.post('/deleteDeficiency', ensureAuthenticated, adminController.deleteDeficiency);
app.post('/deleteDeficiencyTrack', ensureAuthenticated, adminController.deleteDeficiencyTrack);
//Zone Delete
app.post('/deletezone', ensureAuthenticated, adminController.deleteZone);
//Gear Type Delete
app.post('/deleteGearType', ensureAuthenticated, adminController.deleteGearType);
//Gear Type Point Delete
app.post('/deleteGearTypePoint', ensureAuthenticated, adminController.deleteGearTypePoint);
//Gear Type Track Circuit Delete
app.post('/deleteGearTypeTrackCircuit', ensureAuthenticated, adminController.deleteGearTypeTrackCircuit);
//User Delete
app.post('/deleteUser', ensureAuthenticated, adminController.deleteUser);

app.get('/getUpdatedLoop', (req, res) => {
  const loopEndpoint = parseInt(req.query.loopEndpoint); // Assuming you pass loopEndpoint as a query parameter
  let loopContent = '';
  console.log(loopEndpoint);
  console.log(typeof(loopEndpoint));
  for (let i = 3; i <= loopEndpoint+2; i++) {
    loopContent += `
      <div class="w-100"></div>
      <div class="form-row">
                        <div class="form-group col-md-3">
                        <label for="gearID${i}" class="form-label">GearID</label>
                        <input type="text" class="form-control" id="gearID${i}" name="gearID${i}" value="" readonly>
                        </div>
    
                          
                        <div class="form-group col-md-3" >
                            <label for="deficiencies${i}" class="form-label">Deficiencies</label>
                            <select id="deficiencies${i}" class="form-select" name="deficiencies${i}[]" multiple="multiple" >
                                <!-- Options will be populated based on the selected gear -->
                            </select>
                        </div>
                        <div class="form-group col-md-1" id ="LHSPOUR${i}" style="visibility: hidden;" >
                            <label for="LHS${i}" class="form-label">L.H.S Housing pour</label>
                            <input type="number" id="LHS${i}" class="form-control number-input" name="LHS${i}" placeholder="1" >
                        </div>
                        <div class="form-group col-md-1" id = "RHSPOUR${i}" style="  visibility: hidden;" >
                        <label for="RHS${i}" class="form-label">R.H.S. housing poor</label>
                        <input type="number" id="RHS${i}" class="form-control number-input" name="RHS${i}" placeholder="1">
                        </div>
                        <div class="form-group col-md-1" id ="LOOSEPACKING${i}" style=" visibility: hidden;">
                            <label for="LOOSE" class="form-label">Loose Packing</label>
                            <input type="number" id="LOOSE${i}" class="form-control number-input" name="Loose${i}" placeholder="1">
                        </div>
                        <div class="form-group col-md-1" id = "CHAIRPLATED${i}" style=" visibility: hidden;" >
                        <label for="Chair" class="form-label">Chair plated broken </label>
                        <input type="number" id="Chair<%= i%>" class="form-control number-input" name="Chair${i}" placeholder="1">
                        </div>
                        <div class="form-group col-md-1" id ="Guagewelding${i}" style=" visibility: hidden;">
                            <label for="Guage" class="form-label">Guage Tie</label>
                            <input type="number" id="Guage<%= i%>" class="form-control number-input" name="Guage${i}" placeholder="1">
                        </div>
                        <div class="form-group col-md-1" id = "Guagebracket${i}" style=" visibility: hidden;">
                        <label for="Guage_Tie" class="form-label">Guage Tie</label>
                        <input type="number" id="Guage_Tie<%= i%>" class="form-control number-input" name="Guage_Tie${i}" placeholder="1">
                        </div>
                        
                    </div>
    `;
  }
  //console.log(loopContent);
  res.send(loopContent);
});


app.get('/logout', (req, res) => {
  const sessionId = req.sessionID;
  connection.query('DELETE FROM user_sessions WHERE session_id = ?', [sessionId], (err) => {
    if (err) {
      console.error('Error clearing session from database:', err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/login');
    });
  });
});


// Signup route


// app.post('/signup', (req, res, next) => {
//   const { name, email, password, preferences } = req.body;

//   bcrypt.hash(password, 10, (err, hashedPassword) => {
//     if (err) {
//       console.error('Error hashing password:', err);

//     } else {
//       const userData = {
//         name: name,
//         email: email,
//         password:password,
//         hashedPassword: hashedPassword, 
//         preferences: preferences,
//       };

//       formModel.saveUser(userData)
//         .then((user) => {
//           console.log(user)
//           res.redirect('/login'); 
//         })
//         .catch((error) => {
//           console.error('Error saving user data:', error);
//         });
//     }
//   });
// });

app.post('/signup', (req, res, next) => {
  const { name, email, password, preferences } = req.body;

  // Check if the user already exists
  formModel.findUserByEmail(email, (err, existingUser) => {
    if (err) {
      console.error('Error checking for existing user:', err);
      return res.status(500).json({ message: 'Error checking user data' });
    }

    if (existingUser) {
      // User already exists, flash a message and render the signup form again
      return res.render('login', { message: 'User with this email already exists' });
    }

    // Proceed to hash the password if user does not exist
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ message: 'Error processing request' });
      }

      const userData = {
        name: name,
        email: email,
        password: password,
        hashedPassword: hashedPassword,
        preferences: preferences,
      };

      // Save the new user
      formModel.saveUser(userData, (error, user) => {
        if (error) {
          console.error('Error saving user data:', error);
          return res.status(500).json({ message: 'Error saving user data' });
        }
        
        console.log(user);
        res.redirect('/login');
      });
    });
  });
});






// Redirect the root URL to the login page if not logged in
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
