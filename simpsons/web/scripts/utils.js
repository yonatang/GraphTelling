define(function(){
   return {
       clone : function(o) { return JSON.parse(JSON.stringify(o)); },
       forEach : function(o, cb){

           if (o==null){
               return;
           }
           var iter = function(o, keys){
               var i;

               return true;
           };

           for (var i in Object.keys(o)){
               if (cb(o[i],i)===false){
                   return;
               }
           }
       }
   }
});