precision mediump float;

uniform vec4 u_LColor; // 光颜色
uniform vec4 u_color;  // 顶点颜色

varying vec3 v_LDirection; // 光线方向
varying vec3 v_normal;     // 法线方向

void main()
{

    // 先对方向进行序列化，使得向量长度为1
    vec3 LDirection = normalize(v_LDirection);
    vec3 normal = normalize(v_normal);

    // 计算序列化后的光方向和法线方向的点乘
    float dotValue = max(dot(LDirection, normal), 0.2);

    gl_FragColor = u_color * u_LColor * dotValue;
}
