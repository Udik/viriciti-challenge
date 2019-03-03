<template>
<div>
    <b-nav pills>
        <b-nav-item v-for="v in vehicles" 
                    :key="v.code" 
                    :active="current == v.code" 
                    v-on:click="vselect(v.code)"
                    size="sm">
                    {{ v.name }}
        </b-nav-item>
    </b-nav>
</div>
</template>

<script>
export default {
    props: ['vehicles'],
    data() {
        return {
            current: ""
        }
    },
    methods: {
        vselect(val) {
            this.current = val;
            this.$emit('selection', this.current);
        }
    },
    created() {
        this.vselect(this.vehicles[0].code);
    }
}
</script>
