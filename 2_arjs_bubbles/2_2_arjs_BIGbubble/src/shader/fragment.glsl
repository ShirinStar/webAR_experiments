uniform sampler2D uTexture;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;
varying vec2 vUv;
varying vec3 norm;

void main()
{   
    vec2 lookup = (norm.xy + 1.0) / 2.0;
    // // generate an attenuation factor to darken the back
    float attenuation = min(.2, norm.z + 1.0);
    // // flip the x component to mirror the image
    lookup.x = 1.0 - lookup.y;
    // // look up and output the attenuated texture color
    // vec3 color = texture2D(uTexture, lookup).rgb;

    // vec4 reflectedColor = texture2D(uTexture, lookup);
    vec4 reflectedColor = texture2D( uTexture , vec2( -vReflect.x, vReflect.y ) );
    vec4 refractedColor = vec4(1.0 * attenuation);
    
    refractedColor.r = texture2D( uTexture, vec2( -vRefract[0].x, vRefract[0].y ) ).r ;
    refractedColor.g = texture2D( uTexture, vec2( -vRefract[1].x, vRefract[1].y ) ).g ;
    refractedColor.b = texture2D( uTexture, vec2( -vRefract[2].x, vRefract[2].y ) ).b ;
    gl_FragColor =  mix( refractedColor, reflectedColor, clamp( vReflectionFactor , 0.0, 1.0 * attenuation));
  
}