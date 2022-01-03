import { Component } from 'nefbl'

import model from './model.json'
import image3D from 'image3d'

import style from './index.scss'
import template from './index.html'

@Component({
    selector: "app-root",
    template,
    styles: [style]
})
export default class {

    $mounted() {

        // 创建3D对象并配置好画布和着色器
        let image3d = new image3D(document.getElementsByTagName('canvas')[0], {
            "vertex-shader": document.getElementById("vs").innerText,
            "fragment-shader": document.getElementById("fs").innerText,
            depth: true
        })

        let painter = image3d.Painter()
        let buffer = image3d.Buffer()
        let camera = image3d.Camera({
            size: 4
        })

        let colors = {
            12: [0.5, 0.5, 0.5],
            13: [0.5, 0.5, 0.5],
            21: [1, 1, 1],
            22: [0.5, 0.5, 0.5],
            23: [0.5, 0.5, 0.5],
            29: [0.5, 0.5, 0.5],
            30: [0.5, 0.5, 0.5],
            38: [0.5, 0.5, 0.5],
            41: [0.5, 0.5, 0.5],
            42: [0.5, 0.5, 0.5],
            47: [0.3, 0.3, 0.1],
            48: [0.5, 0.5, 0.5],
            49: [0, 1, 1],
            50: [0.5, 0.5, 0],
            56: [0, 0.4, 0]
        }

        setInterval(function () {

            image3d.setUniformMatrix("u_matrix", camera.rotateBody(0.03, -1, 1, 0, 1, -1, 0).value())

            for (let index = 0; index < model.geometries.length; index++) {

                image3d.setUniformFloat("u_color", ...(colors[index] || [0.8, 0.8, 0.8]), 1)

                let position = model.geometries[index].data.attributes.position.array
                buffer.write(new Float32Array(position)).use('a_position', 3, 3, 0)

                painter.drawTriangle(0, position.length / 3)

            }

        }, 20)

    }

}
