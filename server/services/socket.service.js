import { createHash } from 'crypto';

import { 
    DEBUG, 
    ENTERGAME_REQUEST, 
    ENTERGAME_RESPONSE, 
    DISCONNECT, 
    EVAL_SERVER, 
    EVAL_SERVER_RESPONSE,
    INITIALIZE,
    UPDATE, 
    REMOVE } from './../constants';
    
import Ship from './../models/Ship';
import Bomb from './../models/Bomb';
import Vector from './../lib/Vector';

import { SOCKET_LIST, initPack, removePack } from './../db';

export const connectSocket = (socket) => {
    var t = new Date().getTime().toString(); 
	socket.id = createHash('md5').update(t).digest("hex");
	SOCKET_LIST[socket.id] = socket;

    //handles when user enters name and presses enter
	socket.on(ENTERGAME_REQUEST, (data) => { 
        
        Ship.onConnect(socket, data.playerId, data.playerName, data.color , new Vector(200, 100))
        socket.emit(ENTERGAME_RESPONSE, true);
	});
	
	socket.on('disconnect', () => {
        console.log('in disconnect, deleted player');
        delete SOCKET_LIST[socket.id];        
        // delete player
        Ship.onDisconnect(socket);
	});

    
    setInterval(function(){
        let initializerPack = {
            ship: initPack.ship,
            bomb: initPack.bomb,
        }
        let updaterPack = {
            ship: Ship.update(),
            bomb: Bomb.update()
        }
        let removerPack = {
            ship: removePack.ship,
            bomb: removePack.bomb,
        }
        for(var i in SOCKET_LIST){
            var socket = SOCKET_LIST[i];
            socket.emit(INITIALIZE, initializerPack);
            socket.emit(UPDATE, updaterPack);
            socket.emit(REMOVE, removerPack);
        }

        initPack.ship = [];
        initPack.bomb = [];
        removePack.ship = [];
        removePack.bomb = [];
        
    },1000);

};
