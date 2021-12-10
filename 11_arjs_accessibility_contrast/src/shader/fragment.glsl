uniform sampler2D uTexture;
uniform vec3 uColor;
varying vec2 vUv;

void main()
{   
   ///add mix function so it wont be such a rough transiton
    //vec3 color = mix(ucolor, newcolor, videocolor.r -- this needs to be float);

    vec4 videoColor = texture2D( uTexture , vUv + 1.5);
    
    vec3 newColor = uColor;
    vec3 strength = vec3(0.5);

    //if the video feed is too drak -> make the text brighter
   

    newColor.r = 1.0-step(0.6, videoColor.r);
    newColor.g = 1.0-step(0.6, videoColor.g);
    newColor.b = 1.0-step(0.6, videoColor.b);

     if(newColor.r < 0.5 && newColor.g < 0.5 && newColor.b < 0.5) {
     strength = vec3(0.2);
    }
    else {
      strength = vec3(0.4);
    }
    
    float blancedColor = distance(newColor, strength);


    gl_FragColor = vec4(vec3(blancedColor), 1.0);
  
}