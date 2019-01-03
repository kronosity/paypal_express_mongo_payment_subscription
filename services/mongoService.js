((mongoService, mongodb) => {
    var connectionString = process.env.MongoConnectionString || 
    "mongo://localhost:27017/paypaltesting";

    var Connect = (cb)=>{
        mongodb.connect(connectionString, (err, db)=>{
            return cb (err, db, ()=>{db.close(); 
            });
        });
    };

})
    mongoService.Create = (colName, createObj, cb )=> {
        Connect((err, db, close)=> {
            db.collection(colName).insert(createObj, (err, results) => {
                cb(err, results);
                return close();
            });
        });
    };

    mongoService.Read = (colName, readObj, cb) => {
        Connect((err, db, close)=>{
            db.collection(colName).find(readObj).toArray((err, results)=>{
                cb(err, results);
                return close();    
            });
        });
    };

    mongoService.update = (colName, findObj, updateObj, cb) => {
        Connect((err, db, close)=>{
            db.collection(colName).update(findObj, {$set: updateObj }, (err, results)=>{
                cb(err, results);
                return close();
            });
        });
    };

    mongoService.Delete = (colName, findObj, cb )=> {
        Connect((err, db, close)=>{
            db.collection(colName).remove(findObj, (err, results)=>{
                cb(err, results);
                return close();
            });
        });
    }

(
module.exports, 
require('mongodb')
)