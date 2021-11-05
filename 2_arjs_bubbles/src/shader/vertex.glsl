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
  //movement of the bubble
  float elevation = sin(modelPosition.x * uBlubFrequency.x + uTime) 
  * sin(modelPosition.z * uBlubFrequency.y + uTime) * 0.2 ;

  modelPosition.y += elevation;
  
  //vertices position to affect fragment
  //world position = model position
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  
  //normalize returns a vector with the same direction as its parameter but with length 1.
  //mat3 data type is compose for a 3x3 matrix of floating point
  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  
  // = camera position in world space
  vec3 I = worldPosition.xyz - cameraPosition;

  //reflect calculate the reflection direction for an incident vector (incident vector, normal vector)
  vReflect = reflect(I, worldNormal);
  //refract — calculate the refraction direction for an incident vector (incident vector, normal vector, float ratio of indices of refraction)
  //this will be devided to r g b. it's been normalize i think cause it will be obviuse more at the edges
  vRefract[0] = refract(normalize(I), worldNormal, uRefractionRatio);
  vRefract[1] = refract(normalize(I), worldNormal, uRefractionRatio * 0.99);
  vRefract[2] = refract(normalize(I), worldNormal, uRefractionRatio * 0.98);

  //dot returns the dot product of two vectors, x and y
  vReflectionFactor =  uBias + uScale * pow(1.0 + dot(normalize(I), worldNormal), uPower);


  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
    
  gl_Position = projectedPosition;
  
  vUv = uv;
   norm = normal;
}