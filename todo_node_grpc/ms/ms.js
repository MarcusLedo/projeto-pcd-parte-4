const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const todoProto = protoLoader.loadSync('/home/marcusledo/Documents/pcd-parte4/todo_node_grpc/ms/todo.proto');
const server = new grpc.Server();
const fakeDefinition = grpc.loadPackageDefinition(todoProto);

const fakeDB = [
    {id: 1, done: false, task: 'Tarefa 01'},
    {id: 2, done: false, task: 'Tarefa 02'}
]

function changeData(id, checked, task){
    if(!task)
        task = "not found.";
    let res = {id: id, done: false, task: task};

    for(let i = 0; i < fakeDB.length; i++){
        if(fakeDB[i].id == id){
            fakeDB[i].done = checked;
            res = fakeDB[i];
        }
    }

    return res;
}

server.addService(fakeDefinition.TodoService.service, {
    insert: (call, callback) => {
        let todo = call.request;
        let data = changeData(fakeDB.length + 1, false, todo.task);
        if(todo.task)
            fakeDB.push(data);
    },
    list: function (_, callback) {
        callback(null, { fakeDB });
    },
    mark: (call, callback) => {
        let item = call.request;
        callback(null, changeData(item.id, item.checked));
    }
})

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), function(){
    server.start();
    console.log("Server running at 127.0.0.1:50051");
});