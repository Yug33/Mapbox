<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div class="text-center"></div>
      <v-card>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" nuxt to="/map"> Go to Map </v-btn>
          <v-btn color="primary" nuxt to="/layeredMap">
            Go to Layered Map
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>
