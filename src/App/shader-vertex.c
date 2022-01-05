attribute vec3 a_position; // 顶点坐标
uniform mat4 u_matrix;     // 变换矩阵
uniform vec3 u_LPosition;  // 光的位置
attribute vec3 a_normal;

varying vec3 v_LDirection;
varying vec3 v_normal;

void main()
{

    // 坐标新增齐次坐标，为了和矩阵对齐
    gl_Position = u_matrix * vec4(a_position, 1);

    // 点光源方向
    // 顶点的位置应该使用计算过的
    v_LDirection = vec3(gl_Position) - u_LPosition;

    v_normal = vec3(u_matrix * vec4(a_normal, 1));
}
