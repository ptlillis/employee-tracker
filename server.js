//requiring dependencies 

const mysql = require('mysql');
const promisemysql = require("promise-mysql");
const inquirer = require('inquirer');
const cTable = require('console.table');



//creating connection to database

const connection = mysql.createConnect({
  host: 'localhost',

  // Your port, if not 3306
  port: 3306,

  // Your username
  user: 'root',

  password: 'password',
  database: 'employeeTracker_db',
});

//confirming connection + initializing CLI sequence

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}`);
  init();
  // connection.end();
});

//defining CLI sequence using inquierer

function init(){
  inquirer
  .prompt ([
    {
      type: "list",
      message: "What would you like to do?",
      name: "init",
      choices: [
        "Create New Employee Listing",
        "View Employee Roster",
        "Update Employee Listing",
        "Remove Current Employee",
        "Create New Department Listing",
        "View Current Department Roster",
        "Create New Employee Role",
        "View Current Roles",
        "Exit"
      ]
    }
  ])
  .then (function(res){
    switch (res.init){

      case "Create New Employee Listing":
        createEmployee();
        break;

      case "View Employee Roster":
        seeEmployees();
        break;

      case "Update Employee Listing":
        updateEmployee();
        break;          

      case "Remove Current Employee":
        cutEmployee();
        break;

      case "Create New Department Listing":
        createDepartment();
        break;

      case "View Current Department Roster":
        seeDepartments();
        break;

      case "Create New Employee Rople":
        createRole();
        break;

      case "View Current Roles":
        seeRoles();
        break;

      case "Exit":
        connection.end();
        break;
      default:
        text = "Let's work together!"
    
    }
  })
}

//defining createEmployee CLI sequence, followed by an INSERT query

function createEmployee() {
  console.log("Creating a new employee listing");
  inquirer
  .prompt ([
    {
      type: "input",
      message: "First Name?",
      name: "first_name",
    },
    {
      type: "input",
      message: "Last Name?",
      name: "last_name",
    },
    {
      type: "list",
      message: "what is the employee's role?",
      name: "role_id",
      choices: [("Marketing Director", 1), ("Account Manager", 2), ("Internal HR Manager", 3), ("Legal Counsel", 4), ("Head of Accounts", 5), ("Paralegal", 6)]
    },
    {
      type: "input",
      message: "Who is their manager? (please use manager_id as a number",
      name: "manager_id"
    }
  ])
  .then (function(res){
    console.log(res);
    const query = connection.query(
      "INSERT INTO employees SET ?",
      res,
      function(err, res) {
        if (err) throw err;
        console.log("Employee has been added");

        init();
      }
  );
  });
};

//defining view all employee function, which initializes a SELECT FROM query, and placing results in a table

function seeEmployees() {

  connection.query(
        "SELECT * FROM employees",
  function(err, res) {
    if (err) throw err;
    console.table(res);
    init();
  });
}

//defining remove employee function, which establishes a Roster array, and initializes a query for SELECT and DELETE from existing EMPLOYEES table

function cutEmployee(){
  let roster = [];
  connection.query(
    "SELECT employees.first_name, employees.last_name FROM employees", (err,res) => {
      for (let i = 0; i < res.length; i++){
        roster.push(res[i].first_name + " " + res[i].last_name);
      }
  inquirer 
  .prompt ([ 
    {
      type: "list", 
      message: "Select an employee to cut.",
      name: "employee",
      choices: roster

    },
  ])
  .then (function(res){
    const query = connection.query(
      `DELETE FROM employees WHERE concat(first_name, ' ' ,last_name) = '${res.employee}'`,
        function(err, res) {
        if (err) throw err;
        console.log( "Employee has been deleted");
     init();
    });
    });
    }
      );
      };

//defining create department function, which takes CLI data from the user and INSERTS data INTO DEPARTMENTS column in the DEPARTMENT table
     
  function createDepartment(){
          inquirer
          .prompt([
            {
              type: "input",
              name: "name", 
              message: "What is the name of this department?"
            }
          ])
          .then(function(res){
            console.log(res);
            const query = connection.query(
              "INSERT INTO departments SET ?", 
              {
                name: res.name
              }, 
              function(err, res){
                connection.query("SELECT * FROM departments", function(err, res){
                  console.table(res); 
                  init(); 
                })
              }
            )
          })
        }

//defining view all departments function, which initializes a query to SELECT all columns from the DEPARTMENTS table, and releases a console.table with all departments
function seeDepartments(){
          connection.query ("SELECT * FROM departments", function(err, res){
            console.table(res);
            init();
          })
          }


//defining createRole function, which takes in user data via CLI and initalizes INSERT query to insert response into corresponding fields

function createRole() {
     inquirer
    .prompt([
      {
      type: "input", 
      name: "title",
      message: "What is the title of the new role?"
  },
  {
      type: "input",
      name: "salary",
      message: "What is the salary for the new role?"
  },
    ])
    .then (function(res){
      console.log(res);
      const query = connection.query(
        "INSERT INTO roles SET ?",
        {
          title: res.title,
          salary: res.salary,
          departmentid: res.department_id
        },
        function (err,res){
          if (err, res){
            if (err) throw err;
            init();
          }
        }
      )
    })
  }

//defining view all current roles function, which initializes a query to SELECT all from ROLES table, and display in a console.table

const seeRoles = () => {
  connection.query('SELECT roles.id,roles.title,roles.salary  FROM employeeTracker_db.roles inner join employeeTracker_db.departments ON (roles.department_id = departments.id) ', (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    init()
  });
};


function updateEmployee(){
  let employeesCollection = []
  let roleCollection = []
promisemysql.createConnect(connection
).then((connect) => {
  return Promise.all([
    connect.query("SELECT id, title FROM roles ORDER BY title ASC"),
    connect.query("SELECT employees.id, employees.first_name, employees.last_name AS Employee FROM employees ORDER BY employees.id ASC")
  ])
}).then(([roles, employees]) => {
  for (i=0; i < employees.length; i++) {
    employeesCollection.push(employees[i].id)
  }

  for (i=0; i < roles.length; i++){
    roleCollection.push(roles[i].title)
  }
  return Promise.all([roles, employees])
}).then(([roles, employees]) => {
  inquirer.prompt([
    {
      name: "employee",
      type: "list",
      message: "Which employee will you be editing?",
      choices: employeesCollection
    }, {
      name: "role",
      type: "list",
      message: "What is their new title?",
      choices: roleCollection
    },]).then((response) => {
      var role_id;
      var employee_id;
      for (i=0; i < roles.length; i++){
        if (response.roles == roles[i].title){
            role_id = roles[i].id;
        }
    }

    for (i=0; i < employees.length; i++){
        if (response.employee == employees[i].id){
            employee_id = employees[i].id;
        }
    }
    connection.query(`UPDATE employee SET role_id = ${role_id} WHERE id = ${employee_id}`, (err, res) => {
      if(err) return err;

      console.log(`\n ${response.employee} ROLE UPDATED TO ${response.role}...\n `);

      init();
    });
  });
});

}


// all functions lead back to initial CLI function
