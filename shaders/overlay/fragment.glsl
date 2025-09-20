uniform float uAlpha;

void main(){
    vec4 col =vec4(0.0, 0.0, 0.0, uAlpha);
    gl_FragColor = col;
}