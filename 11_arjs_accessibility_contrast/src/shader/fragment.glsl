uniform sampler2D uTexture;
uniform vec3 uColor;
varying vec2 vUv;

void main()
{   
   
    vec4 videoColor = texture2D( uTexture ,vUv );

    vec3 newColor = uColor;
    
    if(videoColor.r < 0.2 && videoColor.g < 0.2 && videoColor.b < 0.2) newColor.r = uColor.r * 2.;
    if(videoColor.r < 0.2 && videoColor.g < 0.2 && videoColor.b < 0.2) newColor.g = uColor.g * 2.;
    if(videoColor.r < 0.2 && videoColor.g < 0.2 && videoColor.b < 0.2) newColor.b = uColor.b * 2.;

    if(videoColor.r > 0.8 && videoColor.g > 0.8 && videoColor.b > 0.8) newColor.r = uColor.r / 2.;
    if(videoColor.r > 0.8 && videoColor.g > 0.8 && videoColor.b > 0.8) newColor.g = uColor.g / 2.;
    if(videoColor.r > 0.8 && videoColor.g > 0.8 && videoColor.b > 0.8) newColor.b = uColor.b / 2.;
    
    gl_FragColor = vec4(newColor, 1.0);
  
}