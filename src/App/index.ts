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

        let colors={
            12:[0,0,0],
            13:[0,0,0],
            20:[0,1,1],
            21:[0,1,1],
            22:[0,0,0],
            23:[0,0,0],
            29:[0,0,0],
            30:[0,0,0],
            38:[0,0,0],
            41:[0,0,0],
            42:[0,0,0],
            47:[0.3,0.3,0.1],
            48:[0,0,0],
            49:[0,1,1],
            50:[0.5,0.5,0],
            56:[0,0.4,0]
        }

        console.log(model.geometries.length)

        setInterval(function () {

            image3d.setUniformMatrix("u_matrix", camera.rotateBody(0.03, -1, 1, 0, 1, -1, 0).value())

            for (let index = 0; index < model.geometries.length; index++) {

                image3d.setUniformFloat("u_color", ...(colors[index]||[0.8, 0.8, 0.8]),1)

                let position = model.geometries[index].data.attributes.position.array
                buffer.write(new Float32Array(position)).use('a_position', 3, 3, 0)

                painter.drawTriangle(0, position.length / 3)

            }

        }, 10)

    }

}
