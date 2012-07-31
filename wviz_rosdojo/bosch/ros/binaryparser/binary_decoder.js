
// only works for big endian
function BinaryDecoder(endian) {
  // default precision and exponent.
  //this.precision = 23;
  //this.exponent = 8;
  this.is_bigendian = endian;

  this.toFloat = function(binary)
  {
    var i,j;
    var buffer = this.toCharCode(binary);
    
    //this.printCharCodeBinaryArray(buffer);
    var sign = 1 - (2 * (buffer[0] >> 7));
    var exponent = ((buffer[0] << 1 ) & 0xff | (buffer[1] >> 7)) - 127;
    var mantissa = ((buffer[1] & 0x7f) << 16) | (buffer[2] << 8) | buffer[3];

    if(mantissa == 0 && exponent == -127)
      return 0.0;

    return sign * (1 + mantissa * Math.pow(2,-23)) * Math.pow(2,exponent);
  }

  this.toInt = function(binary)
  {
    var b = this.toCharCode(binary);
    var str = this.printCharCodeBinaryArray(b);

    return parseInt(str,2);
  }

  this.toCharCode = function(binary) {
    var b = new Array(binary.length);

    for(var i =0; i < binary.length; i++) 
      b[i] = binary.charCodeAt(i);

    if(this.is_bigendian == false) 
      return b.reverse();
    else 
      return b;
  }

  this.printCharCodeBinaryArray = function(buffer) {
    var t = "";

    for(i = 0;i < buffer.length ; i++) {
      for(j =7 ;j >=0; j--) {
        var tt = buffer[i] >> j & 1;
        t = t + tt; 
      }
    }
    return t;
  }
}
