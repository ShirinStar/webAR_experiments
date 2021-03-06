uniform sampler2D uTexture;
uniform vec3 uColor;
varying vec2 vUv;

void main()
{   
    vec4 videoColor = texture2D( uTexture , vUv + 1.5);
    
    vec3 newColor = uColor;
    vec3 strength = vec3(0.5);   

    newColor.r = 1.0-step(0.6, videoColor.r);
    newColor.g = 1.0-step(0.6, videoColor.g);
    newColor.b = 1.0-step(0.6, videoColor.b);

    //if the video feed is too dark -> make the distance calc smaller/bigger
     if(newColor.r < 0.5 && newColor.g < 0.5 && newColor.b < 0.5) {
     strength = vec3(0.2);
    }
    else {
      strength = vec3(0.4);
    }
    
    float balancedColor = distance(newColor, strength);

    gl_FragColor = vec4(vec3(balancedColor), 1.0);
}