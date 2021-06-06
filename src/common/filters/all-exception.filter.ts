import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ERRORS } from '../constants/error.constant';
import { ReturnStatus } from '../constants/system.constant';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status, errMsg: any;
    const recvMsg: any = {
      returnCode: ReturnStatus.ERR,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      if (exception instanceof BadRequestException) {
        errMsg = exception.getResponse();
        recvMsg.message = ERRORS.PARAMS_INVALID;
        recvMsg.extraMsg = errMsg.message;
      } else if (exception instanceof ForbiddenException) {
        recvMsg.message = exception.getResponse();
        if (!recvMsg.message.errCode || !recvMsg.message.errMsg) {
          recvMsg.message = ERRORS.RESOUCE_ROLE_INVALID;
        }
      } else {
        recvMsg.message = exception.getResponse();
      }
    } else {
      console.log(exception);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      recvMsg.message = ERRORS.INTERNAL_SERVER_ERROR;
    }
    response.status(status).json(recvMsg);
  }
}
