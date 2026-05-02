import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [

  transition('* <=> *', [

    query(':enter, :leave', [
      style({
        position: 'fixed',
        width: '100%'
      })
    ], { optional: true }),

    group([

      // LEAVE
      query(':leave', [
        animate('300ms ease',
          style({
            opacity: 0,
            transform: 'translateY(-20px)'
          })
        )
      ], { optional: true }),

      // ENTER
      query(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        animate('400ms ease',
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        )
      ], { optional: true })

    ])

  ])

]);