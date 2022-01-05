import { Component, ref } from 'nefbl'
import xhr from '@hai2007/xhr'

import image3D from 'image3d'

import viewHandler from '@hai2007/browser/viewHandler.js'

import vertexShader from './shader-vertex.c'
import fragmentShader from './shader-fragment.c'

import style from './index.scss'
import template from './index.html'

@Component({
    selector: "app-root",
    template,
    styles: [style]
})
export default class {

    process: number
    hadLoad: boolean
    flag: boolean
    size: number

    $setup() {

        return {
            process: ref(0),
            hadLoad: ref(false),
            flag: ref(true),
            size: ref(window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth)
        }
    }

    $mounted() {

        xhr({

            method: "GET",
            url: "./model.json",
            timeout: 600000,
            xhr: () => {
                let xmlhttp = new XMLHttpRequest()
                xmlhttp.onprogress = data => {
                    this.process = +((data.loaded / 6112727) * 100).toFixed(2)
                }
                return xmlhttp
            }

        }, (data) => {

            this.hadLoad = true

            // 异步是为了兼容safari浏览器
            setTimeout(() => {

                // 成功回调
                this.doit(JSON.parse(data.data))
            })

        }, (error) => {

            // 错误回调
            console.error(error)
            alert('载入出错，请刷新浏览器重试~')

        });

    }

    ctrlFlag() {
        this.flag = !this.flag
    }

    doit(model) {

        // 创建3D对象并配置好画布和着色器
        let image3d = new image3D(document.getElementsByTagName('canvas')[0], {
            "vertex-shader": vertexShader,
            "fragment-shader": fragmentShader,
            depth: true
        })

        let painter = image3d.Painter()
        let buffer = image3d.Buffer()
        let camera = image3d.Camera({
            size: 3
        }).moveBody(0.5, 0, -1, 0).rotateBody(2, 0, 1, 0).rotateBody(-0.5, 1, 0, 0)

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

        // 设置点光源的颜色和位置
        image3d.setUniformFloat("u_LColor", 1, 1, 1, 1)
        image3d.setUniformFloat("u_LPosition", -5, 5, -5)

        let doDraw = function () {
            image3d.setUniformMatrix("u_matrix", camera.value())

            for (let index = 0; index < model.geometries.length; index++) {

                image3d.setUniformFloat("u_color", ...(colors[index] || [0.8, 0.8, 0.8]), 1)

                let position = model.geometries[index].data.attributes.position.array
                let normal = model.geometries[index].data.attributes.normal.array

                let data = []
                for (let i = 0; i < position.length; i += 3) {

                    data.push(position[i])
                    data.push(position[i + 1])
                    data.push(position[i + 2])

                    data.push(normal[i])
                    data.push(normal[i + 1])
                    data.push(normal[i + 2])

                }

                buffer.write(new Float32Array(data))
                    .use('a_position', 3, 6, 0)
                    .use('a_normal', 3, 6, 3)

                painter.drawTriangle(0, position.length / 3)

            }
        }
        doDraw()

        // 每次调整的弧度
        let deg = 0.1
        let rateScale = 1

        viewHandler(data => {

            // 部分操作的时候，消除自动动画会比较好看
            if (['lookUp', 'lookDown', 'lookLeft', 'lookRight', 'rotate'].indexOf(data.type) > -1)
                this.flag = false;

            /*
             * 修改相机
             */

            // 键盘控制
            if (data.type == 'lookUp') {
                camera.rotateBody(deg, 1, 0, 0)
            } else if (data.type == 'lookDown') {
                camera.rotateBody(deg, -1, 0, 0)
            } else if (data.type == 'lookLeft') {
                camera.rotateBody(deg, 0, 1, 0)
            } else if (data.type == 'lookRight') {
                camera.rotateBody(deg, 0, -1, 0)
            }

            // 鼠标拖动或手指控制
            else if (data.type == 'rotate') {
                camera.rotateBody(deg * data.dist * 0.07, ...data.normal)
            }

            // 滚轮控制
            else if (data.type == 'scale') {

                // 设置一个缩放上界
                if (data.kind == 'enlarge' && rateScale >= 1.28) {
                    return
                }

                let baseTimes = 0.993

                let times = data.kind == 'enlarge' ? 2 - baseTimes : baseTimes
                rateScale *= times

                camera.scaleBody(times, times, times, 0, 0, 0)
            }

            // 重新绘制
            doDraw()
        })

        setInterval(() => {

            if (!this.flag) return

            // 传递照相机
            image3d.setUniformMatrix("u_matrix", camera.rotateBody(0.02, 1, 1, 1).value())

            doDraw()

        }, 20)

    }

}
