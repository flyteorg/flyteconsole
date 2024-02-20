import { DecodableType } from '@clients/common/types/adminEntityTypes';

export function decodeProtoResponse<T>(data: ArrayBuffer, messageType: DecodableType<T>): T {
  // ProtobufJS requires Uint8Array, but axios returns an ArrayBuffer
  return messageType.decode(new Uint8Array(data));
}
