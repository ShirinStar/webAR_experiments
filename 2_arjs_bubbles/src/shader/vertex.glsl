uniform float uTime;
uniform vec2 uBlubFrequency;
uniform float uRefractionRatio;
uniform float uBias;
uniform float uScale;
uniform float uPower;

varying vec2 vUv;
varying vec3 norm;
varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

void main() 
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  float elevation = sin(modelPosition.x * uBlubFrequency.x + uTime) 
  * sin(modelPosition.z * uBlubFrequency.y + uTime) * 0.2 ;

  modelPosition.y += elevation;
  
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  vec3 I = worldPosition.xyz - cameraPosition;

  vReflect = reflect( I, worldNormal );
  vRefract[0] = refract( normalize( I ), worldNormal, uRefractionRatio );
  vRefract[1] = refract( normalize( I ), worldNormal, uRefractionRatio * 0.99 );
  vRefract[2] = refract( normalize( I ), worldNormal, uRefractionRatio * 0.98 );
  vReflectionFactor =  uBias + uScale * pow( 1.0 + dot(normalize( I ), worldNormal ), uPower );


  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
    
  gl_Position = projectedPosition;
  
  vUv = uv;
   norm = normal;
}