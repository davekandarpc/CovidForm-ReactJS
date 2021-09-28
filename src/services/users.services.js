import db from "../config/firebase";

class UsersDataService {
  getUser(){
    return db.ref(db.getDatabase(), "users/");
  }

  create(user) {
    return db.push(db.ref(db.getDatabase(), "users/"), user);
  }

  createAsnwer(answ){
    return db.push(db.ref(db.getDatabase(), "Answer/"), answ);
  }

  getAnswer(){
    return db.ref(db.getDatabase(), "Answer/");
  }
  
}

export default new UsersDataService();