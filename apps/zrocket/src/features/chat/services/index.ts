import { RoomService } from './room.service.js';
import { MessageService } from './message.service.js';
import { RoomAccessService } from './room-access.service.js';

export { RoomService, MessageService, RoomAccessService };

export const chatServices = [RoomService, MessageService, RoomAccessService];
