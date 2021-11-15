uniform sampler2D uTexture;
uniform float uDistance;
uniform float uOpacity;
uniform vec3 uTint;

varying vec3 vRefract;

void main() 
{
	vec2 p = vec2( vRefract.x * uDistance + 0.5, vRefract.y * uDistance + 0.5 );
	p = vec2(1.0, 1.0) - p;
	vec3 color = texture2D( uTexture, p ).rgb;
	gl_FragColor = vec4( color, uOpacity ) * vec4( uTint, 1.0 );
  
}  