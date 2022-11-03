// Needed in order for protobufjs to properly convert int64s
import Long from 'long';
import $protobuf from 'protobufjs/minimal';

$protobuf.util.Long = Long;
$protobuf.configure();
