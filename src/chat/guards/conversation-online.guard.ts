import { CanActivate, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ConversationOnlineGuard implements CanActivate {
  constructor() {}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const conversation = context.conversation;

    if (!conversation) {
      return false;
    }

    return conversation.status === true;
  }
}
