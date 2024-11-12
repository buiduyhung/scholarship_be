import { CanActivate, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class ConversationGuard implements CanActivate {
  constructor(private conversationService: ChatService) {}

  private extractRoom(context: any): string {
    const queryToken = context.args[0].handshake.query.roomId;
    if (queryToken) {
      return queryToken;
    }

    return context.args[0].handshake.headers.roomId;
  }

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const conversation = this.extractRoom(context);
    try {
      return new Promise((resolve, reject) => {
        if (!conversation) {
          return reject(false);
        }
        this.conversationService
          .getConversationById(conversation)
          .then((conversation) => {
            if (conversation) {
              context.args[0].conversation = conversation;
              context.conversation = conversation;
              return resolve(conversation);
            } else {
              reject(false);
            }
          });
      });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}
