<script>
import { Line, mixins } from 'vue-chartjs'

export default {
    extends: Line,
    mixins: [mixins.reactiveProp],
    props: ['chartData', 'label'],
    data() {
        return {
            data: {
                labels: Array(50),
                datasets: [{
                    label: this.label,
                    data: [],
                
                    borderColor: "#0ab",
                    //backgroundColor: "#0ab",
                    fill: false,
                }],
            },
            options: {
                responsive: true,
            },
            updateNum: 0
        }
    },
    methods: {
        clear() {
            this.updateNum ++;
            this.data.datasets[0].data = [];
            this.$data._chart.update();
        },
        addValue(value) {
            let data = this.data.datasets[0].data;
            data.push(value);
            if (data.length > 50) data.shift();
            this.$data._chart.update();
        },
        prependValue(value) {
            let data = this.data.datasets[0].data;
            data.unshift(value);
            if (data.length > 50) data.pop();
            this.$data._chart.update();
        },
        setValues(vals, dir) {
            // this property tracks the current update number
            // to interrupt current slide and avoid mixing
            // its values with a new incoming slide 
            this.updateNum ++;

            if (dir == "bck")
                this.slideBackward(vals)
            else
                this.slideForward(vals);
        },
        async slideForward(vals) {
            let n = this.updateNum;
            for (let i = 0; i < vals.length; i++) {
                // interrupt if there'a new update
                if (n !== this.updateNum) return;

                await timeout(10);
                this.addValue(vals[i]);
            };
        },
        async slideBackward(vals) {
            let n = this.updateNum;
            for (let i = vals.length - 1, k = 0; i >= 0; i--, k++) {
                // interrupt if there'a new update
                if (n !== this.updateNum) return;

                await timeout(10);
                this.prependValue(vals[i]);
            };
        }
    },
    mounted() {
        this.renderChart(this.data, this.options)
    }
}

function timeout(t, v) {
    return new Promise(resolve => {
        setTimeout(resolve.bind(null, v), t)
    });
}
</script>