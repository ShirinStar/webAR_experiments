uniform float uRefractionRatio;

varying vec3 vRefract;

void main() 
{ 
	vec4 mPosition = modelMatrix * vec4( position, 1.0 );
  //normalize returns a vector with the same direction as its parameter but with length 1.
  //mat3 data type is compose for a 3x3 matrix of floating point
	vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
	
  vRefract = normalize( refract( normalize( mPosition.xyz - cameraPosition ), nWorld, uRefractionRatio ) );
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

