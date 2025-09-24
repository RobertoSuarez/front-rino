import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { FooterWidget } from './components/footerwidget';
import { AboutWidget } from './components/aboutwidget';
import { ValuePropWidget } from './components/valuepropwidget';
import { TestimonialsWidget } from './components/testimonialswidget';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, TopbarWidget, HeroWidget, AboutWidget, ValuePropWidget, FeaturesWidget, TestimonialsWidget, FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div class="mx-auto" style="max-width: 1440px;">
                <topbar-widget class="py-4 sm:py-6 px-4 sm:px-6 flex items-center justify-between relative lg:static" />
            </div>
            <div id="home" class="landing-wrapper overflow-hidden">
                <div class="mx-auto" style="max-width: 1440px;">
                    <hero-widget />
                    <about-widget />
                    <features-widget />
                    <valueprop-widget />
                    <testimonials-widget />
                    <footer-widget />
                </div>
            </div>
        </div>
    `
})
export class Landing {}
