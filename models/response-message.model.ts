import { ApiProperty } from "@nestjs/swagger";
import { ResponseStatus } from "../enums/response-status.enum";

export class ResponseMessage {
  @ApiProperty({ type: "enum", enum: ResponseStatus })
  public status: ResponseStatus;
  @ApiProperty()
  public message: string;
  
  @ApiProperty()
  public data?: object;
}
